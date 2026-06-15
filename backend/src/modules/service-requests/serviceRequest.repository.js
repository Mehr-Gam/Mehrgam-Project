import { pool, query } from '../../config/db.js';

const requestSelect = `
  SELECT
    sr.request_id,
    sr.dis_id,
    sr.sup_id,
    sr.requester_user_id,
    sr.request_type,
    sr.requested_time,
    sr.origin_address,
    sr.origin_lat,
    sr.origin_lng,
    sr.destination_address,
    sr.destination_lat,
    sr.destination_lng,
    sr.description,
    sr.status,
    sr.created_at,
    sr.updated_at,
    du.first_name AS disabled_first_name,
    du.last_name AS disabled_last_name
  FROM service_requests sr
  JOIN disabled d ON d.dis_id = sr.dis_id
  JOIN users du ON du.user_id = d.user_id
`;

const requestReturning = `
  request_id,
  dis_id,
  sup_id,
  requester_user_id,
  request_type,
  requested_time,
  origin_address,
  origin_lat,
  origin_lng,
  destination_address,
  destination_lat,
  destination_lng,
  description,
  status,
  created_at,
  updated_at
`;

const acceptReturning = `
  accept_id,
  request_id,
  vol_id,
  volunteer_lat_at_accept,
  volunteer_lng_at_accept,
  estimated_distance_meters,
  estimated_duration_seconds,
  route_provider,
  route_calculated_at,
  accepted_at,
  started_at,
  finished_at,
  status
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

export const createServiceRequest = async ({
  disId,
  supId,
  requesterUserId,
  requestType,
  requestedTime,
  originAddress,
  originLat,
  originLng,
  destinationAddress,
  destinationLat,
  destinationLng,
  description
}) => {
  const result = await query(
    `
    INSERT INTO service_requests (
      dis_id,
      sup_id,
      requester_user_id,
      request_type,
      requested_time,
      origin_address,
      origin_lat,
      origin_lng,
      destination_address,
      destination_lat,
      destination_lng,
      description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING
      ${requestReturning}
    `,
    [
      disId,
      supId,
      requesterUserId,
      requestType,
      requestedTime,
      originAddress || null,
      originLat,
      originLng,
      destinationAddress || null,
      destinationLat ?? null,
      destinationLng ?? null,
      description || null
    ]
  );

  return result.rows[0];
};

export const findRequestsByDisabled = async (disId) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE sr.dis_id = $1
    ORDER BY sr.created_at DESC
    `,
    [disId]
  );

  return result.rows;
};

export const findRequestsBySupervisor = async (supId) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE sr.sup_id = $1
    ORDER BY sr.created_at DESC
    `,
    [supId]
  );

  return result.rows;
};

export const findServiceRequestById = async (requestId) => {
  const result = await query(
    `
    ${requestSelect}
    WHERE sr.request_id = $1
    LIMIT 1
    `,
    [requestId]
  );

  return result.rows[0] || null;
};

export const findVolunteerForMatching = async (volId) => {
  const result = await query(
    `
    SELECT
      vol_id,
      current_lat,
      current_lng,
      location_updated_at,
      is_online,
      verification_status
    FROM volunteers
    WHERE vol_id = $1
    LIMIT 1
    `,
    [volId]
  );

  return result.rows[0] || null;
};

export const findAvailableRequestsForVolunteer = async (volId) => {
  const result = await query(
    `
    SELECT DISTINCT ON (sr.request_id)
      sr.request_id,
      sr.dis_id,
      sr.sup_id,
      sr.requester_user_id,
      sr.request_type,
      sr.requested_time,
      sr.origin_address,
      sr.origin_lat,
      sr.origin_lng,
      sr.destination_address,
      sr.destination_lat,
      sr.destination_lng,
      sr.description,
      sr.status,
      sr.created_at,
      sr.updated_at,
      du.first_name AS disabled_first_name,
      du.last_name AS disabled_last_name
    FROM service_requests sr
    JOIN disabled d ON d.dis_id = sr.dis_id
    JOIN users du ON du.user_id = d.user_id
    JOIN volunteer_availability va
      ON va.vol_id = $1
      AND va.is_active = TRUE
      AND va.weekday = EXTRACT(DOW FROM sr.requested_time)::INT
      AND sr.requested_time::TIME >= va.start_time
      AND sr.requested_time::TIME < va.end_time
    WHERE sr.status = 'pending'
    ORDER BY sr.request_id, sr.requested_time ASC
    `,
    [volId]
  );

  return result.rows;
};

export const acceptRequest = async ({
  requestId,
  volId,
  volunteerLatAtAccept,
  volunteerLngAtAccept,
  estimatedDistanceMeters,
  estimatedDurationSeconds,
  routeProvider
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const requestResult = await client.query(
      `
      SELECT
        request_id,
        requested_time,
        origin_lat,
        origin_lng,
        status
      FROM service_requests
      WHERE request_id = $1
      FOR UPDATE
      `,
      [requestId]
    );

    const request = requestResult.rows[0] || null;

    if (!request) {
      await client.query('ROLLBACK');
      return { type: 'not_found' };
    }

    if (request.status !== 'pending') {
      await client.query('ROLLBACK');
      return { type: 'already_taken' };
    }

    const availabilityResult = await client.query(
      `
      SELECT avail_id
      FROM volunteer_availability
      WHERE vol_id = $1
        AND is_active = TRUE
        AND weekday = EXTRACT(DOW FROM $2::TIMESTAMP)::INT
        AND $2::TIMESTAMP::TIME >= start_time
        AND $2::TIMESTAMP::TIME < end_time
      LIMIT 1
      `,
      [volId, request.requested_time]
    );

    if (!availabilityResult.rows[0]) {
      await client.query('ROLLBACK');
      return { type: 'not_available_at_time' };
    }

    const updateResult = await client.query(
      `
      UPDATE service_requests
      SET
        status = 'accepted',
        updated_at = CURRENT_TIMESTAMP
      WHERE request_id = $1
      RETURNING
        ${requestReturning}
      `,
      [requestId]
    );

    const acceptResult = await client.query(
      `
      INSERT INTO request_accepts (
        request_id,
        vol_id,
        volunteer_lat_at_accept,
        volunteer_lng_at_accept,
        estimated_distance_meters,
        estimated_duration_seconds,
        route_provider,
        route_calculated_at,
        accepted_at,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'accepted')
      RETURNING
        ${acceptReturning}
      `,
      [
        requestId,
        volId,
        volunteerLatAtAccept,
        volunteerLngAtAccept,
        estimatedDistanceMeters,
        estimatedDurationSeconds,
        routeProvider
      ]
    );

    await client.query('COMMIT');

    return {
      type: 'accepted',
      request: updateResult.rows[0],
      accept: acceptResult.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const startRequest = async ({ requestId, volId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const requestResult = await client.query(
      `
      SELECT
        request_id,
        status
      FROM service_requests
      WHERE request_id = $1
      FOR UPDATE
      `,
      [requestId]
    );

    const request = requestResult.rows[0] || null;

    if (!request) {
      await client.query('ROLLBACK');
      return { type: 'not_found' };
    }

    const acceptOwnerResult = await client.query(
      `
      SELECT
        accept_id,
        vol_id,
        status
      FROM request_accepts
      WHERE request_id = $1
      LIMIT 1
      FOR UPDATE
      `,
      [requestId]
    );

    const acceptOwner = acceptOwnerResult.rows[0] || null;

    if (!acceptOwner || acceptOwner.vol_id !== volId) {
      await client.query('ROLLBACK');
      return { type: 'not_owner' };
    }

    if (request.status !== 'accepted' || acceptOwner.status !== 'accepted') {
      await client.query('ROLLBACK');
      return { type: 'invalid_status' };
    }

    const requestUpdateResult = await client.query(
      `
      UPDATE service_requests
      SET
        status = 'in_progress',
        updated_at = CURRENT_TIMESTAMP
      WHERE request_id = $1
      RETURNING
        ${requestReturning}
      `,
      [requestId]
    );

    const acceptUpdateResult = await client.query(
      `
      UPDATE request_accepts
      SET
        status = 'started',
        started_at = CURRENT_TIMESTAMP
      WHERE request_id = $1
      RETURNING
        ${acceptReturning}
      `,
      [requestId]
    );

    await client.query('COMMIT');

    return {
      type: 'started',
      request: requestUpdateResult.rows[0],
      accept: acceptUpdateResult.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const finishRequest = async ({ requestId, volId }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const requestResult = await client.query(
      `
      SELECT
        request_id,
        status
      FROM service_requests
      WHERE request_id = $1
      FOR UPDATE
      `,
      [requestId]
    );

    const request = requestResult.rows[0] || null;

    if (!request) {
      await client.query('ROLLBACK');
      return { type: 'not_found' };
    }

    const acceptOwnerResult = await client.query(
      `
      SELECT
        accept_id,
        vol_id,
        status
      FROM request_accepts
      WHERE request_id = $1
      LIMIT 1
      FOR UPDATE
      `,
      [requestId]
    );

    const acceptOwner = acceptOwnerResult.rows[0] || null;

    if (!acceptOwner || acceptOwner.vol_id !== volId) {
      await client.query('ROLLBACK');
      return { type: 'not_owner' };
    }

    if (request.status !== 'in_progress' || acceptOwner.status !== 'started') {
      await client.query('ROLLBACK');
      return { type: 'invalid_status' };
    }

    const requestUpdateResult = await client.query(
      `
      UPDATE service_requests
      SET
        status = 'finished',
        updated_at = CURRENT_TIMESTAMP
      WHERE request_id = $1
      RETURNING
        ${requestReturning}
      `,
      [requestId]
    );

    const acceptUpdateResult = await client.query(
      `
      UPDATE request_accepts
      SET
        status = 'finished',
        finished_at = CURRENT_TIMESTAMP
      WHERE request_id = $1
      RETURNING
        ${acceptReturning}
      `,
      [requestId]
    );

    await client.query('COMMIT');

    return {
      type: 'finished',
      request: requestUpdateResult.rows[0],
      accept: acceptUpdateResult.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const canUserCancelRequest = ({ user, request, accept }) => {
  if (user.role === 'disabled') {
    return request.dis_id === user.disId;
  }

  if (user.role === 'supervisor') {
    return request.sup_id === user.supId;
  }

  if (user.role === 'volunteer') {
    return accept && accept.vol_id === user.volId;
  }

  return false;
};

export const cancelRequest = async ({ requestId, user }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const requestResult = await client.query(
      `
      SELECT
        request_id,
        dis_id,
        sup_id,
        requester_user_id,
        request_type,
        requested_time,
        origin_address,
        origin_lat,
        origin_lng,
        destination_address,
        destination_lat,
        destination_lng,
        description,
        status,
        created_at,
        updated_at
      FROM service_requests
      WHERE request_id = $1
      FOR UPDATE
      `,
      [requestId]
    );

    const request = requestResult.rows[0] || null;

    if (!request) {
      await client.query('ROLLBACK');
      return { type: 'not_found' };
    }

    const acceptResult = await client.query(
      `
      SELECT
        ${acceptReturning}
      FROM request_accepts
      WHERE request_id = $1
      LIMIT 1
      FOR UPDATE
      `,
      [requestId]
    );

    const accept = acceptResult.rows[0] || null;

    if (!canUserCancelRequest({ user, request, accept })) {
      await client.query('ROLLBACK');
      return { type: 'not_owner' };
    }

    if (!['pending', 'accepted', 'in_progress'].includes(request.status)) {
      await client.query('ROLLBACK');
      return { type: 'invalid_status' };
    }

    const requestUpdateResult = await client.query(
      `
      UPDATE service_requests
      SET
        status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
      WHERE request_id = $1
      RETURNING
        ${requestReturning}
      `,
      [requestId]
    );

    let acceptUpdate = null;

    if (accept) {
      const acceptUpdateResult = await client.query(
        `
        UPDATE request_accepts
        SET status = 'cancelled'
        WHERE request_id = $1
        RETURNING
          ${acceptReturning}
        `,
        [requestId]
      );

      acceptUpdate = acceptUpdateResult.rows[0];
    }

    await client.query('COMMIT');

    return {
      type: 'cancelled',
      request: requestUpdateResult.rows[0],
      accept: acceptUpdate
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
