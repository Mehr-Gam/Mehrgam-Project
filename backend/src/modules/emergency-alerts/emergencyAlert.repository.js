import { pool, query } from '../../config/db.js';

const alertSelect = `
  SELECT
    ea.alert_id,
    ea.dis_id,
    ea.sup_id,
    ea.requester_user_id,
    ea.alert_status,
    ea.alert_lat,
    ea.alert_lng,
    ea.address,
    ea.triggered_at,
    ea.resolved_at,
    du.first_name AS disabled_first_name,
    du.last_name AS disabled_last_name,
    su.first_name AS supervisor_first_name,
    su.last_name AS supervisor_last_name,
    ru.first_name AS requester_first_name,
    ru.last_name AS requester_last_name,
    ru.role AS requester_role
  FROM emergency_alerts ea
  JOIN disabled d ON d.dis_id = ea.dis_id
  JOIN users du ON du.user_id = d.user_id
  LEFT JOIN supervisors s ON s.sup_id = ea.sup_id
  LEFT JOIN users su ON su.user_id = s.user_id
  LEFT JOIN users ru ON ru.user_id = ea.requester_user_id
`;

const alertReturning = `
  alert_id,
  dis_id,
  sup_id,
  requester_user_id,
  alert_status,
  alert_lat,
  alert_lng,
  address,
  triggered_at,
  resolved_at
`;

export const findDisabledById = async (disId) => {
  const result = await query(
    `
    SELECT
      d.dis_id,
      d.user_id,
      d.sup_id,
      d.home_address,
      u.first_name,
      u.last_name
    FROM disabled d
    JOIN users u ON u.user_id = d.user_id
    WHERE d.dis_id = $1
    LIMIT 1
    `,
    [disId]
  );

  return result.rows[0] || null;
};

export const findDisabledBySupervisor = async ({ disId, supId }) => {
  const result = await query(
    `
    SELECT
      d.dis_id,
      d.user_id,
      d.sup_id,
      d.home_address,
      u.first_name,
      u.last_name
    FROM disabled d
    JOIN users u ON u.user_id = d.user_id
    WHERE d.dis_id = $1
      AND d.sup_id = $2
    LIMIT 1
    `,
    [disId, supId]
  );

  return result.rows[0] || null;
};

export const createEmergencyAlert = async ({
  disId,
  supId,
  requesterUserId,
  alertLat,
  alertLng,
  address
}) => {
  const result = await query(
    `
    INSERT INTO emergency_alerts (
      dis_id,
      sup_id,
      requester_user_id,
      alert_status,
      alert_lat,
      alert_lng,
      address
    )
    VALUES ($1, $2, $3, 'sent', $4, $5, $6)
    RETURNING
      ${alertReturning}
    `,
    [
      disId,
      supId,
      requesterUserId,
      alertLat,
      alertLng,
      address || null
    ]
  );

  return result.rows[0];
};

export const findAlertsByDisabled = async (disId) => {
  const result = await query(
    `
    ${alertSelect}
    WHERE ea.dis_id = $1
    ORDER BY ea.triggered_at DESC
    `,
    [disId]
  );

  return result.rows;
};

export const findAlertsBySupervisor = async (supId) => {
  const result = await query(
    `
    ${alertSelect}
    WHERE ea.sup_id = $1
    ORDER BY ea.triggered_at DESC
    `,
    [supId]
  );

  return result.rows;
};

const canUserManageAlert = ({ user, alert }) => {
  if (user.role === 'disabled') {
    return alert.dis_id === user.disId;
  }

  if (user.role === 'supervisor') {
    return alert.sup_id === user.supId;
  }

  return false;
};

const changeAlertStatus = async ({ alertId, user, nextStatus }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const alertResult = await client.query(
      `
      SELECT
        alert_id,
        dis_id,
        sup_id,
        requester_user_id,
        alert_status,
        alert_lat,
        alert_lng,
        address,
        triggered_at,
        resolved_at
      FROM emergency_alerts
      WHERE alert_id = $1
      FOR UPDATE
      `,
      [alertId]
    );

    const alert = alertResult.rows[0] || null;

    if (!alert) {
      await client.query('ROLLBACK');
      return { type: 'not_found' };
    }

    if (!canUserManageAlert({ user, alert })) {
      await client.query('ROLLBACK');
      return { type: 'not_owner' };
    }

    if (!['pending', 'sent'].includes(alert.alert_status)) {
      await client.query('ROLLBACK');
      return { type: 'invalid_status' };
    }

    const resolvedAtSql = nextStatus === 'resolved' ? 'CURRENT_TIMESTAMP' : 'resolved_at';

    const updateResult = await client.query(
      `
      UPDATE emergency_alerts
      SET
        alert_status = $1,
        resolved_at = ${resolvedAtSql}
      WHERE alert_id = $2
      RETURNING
        ${alertReturning}
      `,
      [nextStatus, alertId]
    );

    await client.query('COMMIT');

    return {
      type: nextStatus,
      alert: updateResult.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const resolveEmergencyAlert = async ({ alertId, user }) => {
  return changeAlertStatus({
    alertId,
    user,
    nextStatus: 'resolved'
  });
};

export const cancelEmergencyAlert = async ({ alertId, user }) => {
  return changeAlertStatus({
    alertId,
    user,
    nextStatus: 'cancelled'
  });
};
