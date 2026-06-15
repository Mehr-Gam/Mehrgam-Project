import { query } from '../../config/db.js';

const buildSearchClause = ({ search, params, columns }) => {
  if (!search) {
    return '';
  }

  params.push(`%${search.toLowerCase()}%`);
  const paramIndex = params.length;

  const searchParts = columns.map((column) => `LOWER(${column}) LIKE $${paramIndex}`);

  return ` AND (${searchParts.join(' OR ')})`;
};

export const findUsers = async ({ role, isActive, search, limit, offset }) => {
  const params = [];
  let whereClause = 'WHERE 1 = 1';

  if (role) {
    params.push(role);
    whereClause += ` AND u.role = $${params.length}`;
  }

  if (typeof isActive === 'boolean') {
    params.push(isActive);
    whereClause += ` AND u.is_active = $${params.length}`;
  }

  whereClause += buildSearchClause({
    search,
    params,
    columns: [
      'u.national_code',
      'u.first_name',
      'u.last_name',
      'u.phone',
      'u.city',
      'u.province'
    ]
  });

  const countResult = await query(
    `
    SELECT COUNT(*)::int AS total
    FROM users u
    ${whereClause}
    `,
    params
  );

  const listParams = [...params, limit, offset];

  const result = await query(
    `
    SELECT
      u.user_id,
      u.national_code,
      u.first_name,
      u.last_name,
      u.phone,
      u.birth_date,
      u.province,
      u.city,
      u.role,
      u.is_active,
      u.created_at,
      u.updated_at,
      d.dis_id,
      d.accessibility_need,
      d.home_address AS disabled_home_address,
      d.sup_id AS disabled_sup_id,
      s.sup_id,
      v.vol_id,
      v.home_address AS volunteer_home_address,
      v.verification_status,
      v.verified_at,
      v.is_online
    FROM users u
    LEFT JOIN disabled d ON d.user_id = u.user_id
    LEFT JOIN supervisors s ON s.user_id = u.user_id
    LEFT JOIN volunteers v ON v.user_id = u.user_id
    ${whereClause}
    ORDER BY u.created_at DESC, u.user_id DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `,
    listParams
  );

  return {
    users: result.rows,
    total: countResult.rows[0].total
  };
};

export const findUserDetailsById = async (userId) => {
  const result = await query(
    `
    SELECT
      u.user_id,
      u.national_code,
      u.first_name,
      u.last_name,
      u.phone,
      u.birth_date,
      u.province,
      u.city,
      u.role,
      u.is_active,
      u.created_at,
      u.updated_at,
      d.dis_id,
      d.accessibility_need,
      d.home_address AS disabled_home_address,
      d.sup_id AS disabled_sup_id,
      s.sup_id,
      v.vol_id,
      v.home_address AS volunteer_home_address,
      v.current_lat,
      v.current_lng,
      v.location_updated_at,
      v.is_online,
      v.verification_status,
      v.verified_at
    FROM users u
    LEFT JOIN disabled d ON d.user_id = u.user_id
    LEFT JOIN supervisors s ON s.user_id = u.user_id
    LEFT JOIN volunteers v ON v.user_id = u.user_id
    WHERE u.user_id = $1
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
};

export const findUserBasicById = async (userId) => {
  const result = await query(
    `
    SELECT
      user_id,
      role,
      is_active
    FROM users
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
};

export const setUserActiveStatus = async ({ userId, isActive }) => {
  const result = await query(
    `
    UPDATE users
    SET
      is_active = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $2
    RETURNING
      user_id,
      national_code,
      first_name,
      last_name,
      phone,
      role,
      is_active,
      created_at,
      updated_at
    `,
    [isActive, userId]
  );

  return result.rows[0] || null;
};

export const revokeAllRefreshTokensForUser = async (userId) => {
  await query(
    `
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
      AND revoked_at IS NULL
    `,
    [userId]
  );
};

export const findUserByNationalCodeOrPhone = async ({ nationalCode, phone }) => {
  const result = await query(
    `
    SELECT
      user_id,
      national_code,
      phone,
      role
    FROM users
    WHERE national_code = $1
       OR phone = $2
    LIMIT 1
    `,
    [nationalCode, phone]
  );

  return result.rows[0] || null;
};

export const createAdminUser = async ({
  nationalCode,
  firstName,
  lastName,
  phone,
  birthDate,
  province,
  city,
  passwordHash
}) => {
  const result = await query(
    `
    INSERT INTO users (
      national_code,
      first_name,
      last_name,
      phone,
      birth_date,
      province,
      city,
      password_hash,
      role,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'admin', TRUE)
    RETURNING
      user_id,
      national_code,
      first_name,
      last_name,
      phone,
      birth_date,
      province,
      city,
      role,
      is_active,
      created_at,
      updated_at
    `,
    [
      nationalCode,
      firstName,
      lastName,
      phone,
      birthDate || null,
      province || null,
      city || null,
      passwordHash
    ]
  );

  return result.rows[0];
};

export const findVolunteers = async ({ status, search, limit, offset }) => {
  const params = [];
  let whereClause = 'WHERE 1 = 1';

  if (status) {
    params.push(status);
    whereClause += ` AND v.verification_status = $${params.length}`;
  }

  whereClause += buildSearchClause({
    search,
    params,
    columns: [
      'u.national_code',
      'u.first_name',
      'u.last_name',
      'u.phone',
      'u.city',
      'u.province',
      'v.home_address'
    ]
  });

  const countResult = await query(
    `
    SELECT COUNT(*)::int AS total
    FROM volunteers v
    JOIN users u ON u.user_id = v.user_id
    ${whereClause}
    `,
    params
  );

  const listParams = [...params, limit, offset];

  const result = await query(
    `
    SELECT
      v.vol_id,
      v.user_id,
      v.home_address,
      v.current_lat,
      v.current_lng,
      v.location_updated_at,
      v.is_online,
      v.verification_status,
      v.verified_at,
      v.created_at AS volunteer_created_at,
      u.national_code,
      u.first_name,
      u.last_name,
      u.phone,
      u.birth_date,
      u.province,
      u.city,
      u.is_active,
      u.created_at AS user_created_at
    FROM volunteers v
    JOIN users u ON u.user_id = v.user_id
    ${whereClause}
    ORDER BY v.created_at DESC, v.vol_id DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `,
    listParams
  );

  return {
    volunteers: result.rows,
    total: countResult.rows[0].total
  };
};

export const findVolunteerDetailsById = async (volId) => {
  const result = await query(
    `
    SELECT
      v.vol_id,
      v.user_id,
      v.home_address,
      v.current_lat,
      v.current_lng,
      v.location_updated_at,
      v.is_online,
      v.verification_status,
      v.verified_at,
      v.created_at AS volunteer_created_at,
      u.national_code,
      u.first_name,
      u.last_name,
      u.phone,
      u.birth_date,
      u.province,
      u.city,
      u.is_active,
      u.created_at AS user_created_at
    FROM volunteers v
    JOIN users u ON u.user_id = v.user_id
    WHERE v.vol_id = $1
    LIMIT 1
    `,
    [volId]
  );

  return result.rows[0] || null;
};

export const updateVolunteerVerificationStatus = async ({ volId, status }) => {
  const result = await query(
    `
    UPDATE volunteers
    SET
      verification_status = $1::varchar(20),
      verified_at = CASE
        WHEN $1::text = 'approved' THEN CURRENT_TIMESTAMP
        ELSE NULL
      END
    WHERE vol_id = $2::int
    RETURNING
      vol_id,
      user_id,
      home_address,
      current_lat,
      current_lng,
      location_updated_at,
      is_online,
      verification_status,
      verified_at,
      created_at AS volunteer_created_at
    `,
    [status, volId]
  );

  return result.rows[0] || null;
};

export const findDisabledProfiles = async ({ search, isActive, limit, offset }) => {
  const params = [];
  let whereClause = 'WHERE 1 = 1';

  if (typeof isActive === 'boolean') {
    params.push(isActive);
    whereClause += ` AND u.is_active = $${params.length}`;
  }

  whereClause += buildSearchClause({
    search,
    params,
    columns: [
      'u.national_code',
      'u.first_name',
      'u.last_name',
      'u.phone',
      'u.city',
      'u.province',
      'd.home_address',
      'd.accessibility_need',
      'su.first_name',
      'su.last_name',
      'su.phone'
    ]
  });

  const countResult = await query(
    `
    SELECT COUNT(*)::int AS total
    FROM disabled d
    JOIN users u ON u.user_id = d.user_id
    LEFT JOIN supervisors s ON s.sup_id = d.sup_id
    LEFT JOIN users su ON su.user_id = s.user_id
    ${whereClause}
    `,
    params
  );

  const listParams = [...params, limit, offset];

  const result = await query(
    `
    SELECT
      d.dis_id,
      d.user_id,
      d.sup_id,
      d.accessibility_need,
      d.home_address,
      d.created_at AS disabled_created_at,
      u.national_code,
      u.first_name,
      u.last_name,
      u.phone,
      u.birth_date,
      u.province,
      u.city,
      u.is_active,
      u.created_at AS user_created_at,
      su.user_id AS supervisor_user_id,
      su.national_code AS supervisor_national_code,
      su.first_name AS supervisor_first_name,
      su.last_name AS supervisor_last_name,
      su.phone AS supervisor_phone
    FROM disabled d
    JOIN users u ON u.user_id = d.user_id
    LEFT JOIN supervisors s ON s.sup_id = d.sup_id
    LEFT JOIN users su ON su.user_id = s.user_id
    ${whereClause}
    ORDER BY d.created_at DESC, d.dis_id DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `,
    listParams
  );

  return {
    disabled: result.rows,
    total: countResult.rows[0].total
  };
};

export const findSupervisorProfiles = async ({ search, isActive, limit, offset }) => {
  const params = [];
  let whereClause = 'WHERE 1 = 1';

  if (typeof isActive === 'boolean') {
    params.push(isActive);
    whereClause += ` AND u.is_active = $${params.length}`;
  }

  whereClause += buildSearchClause({
    search,
    params,
    columns: [
      'u.national_code',
      'u.first_name',
      'u.last_name',
      'u.phone',
      'u.city',
      'u.province'
    ]
  });

  const countResult = await query(
    `
    SELECT COUNT(*)::int AS total
    FROM supervisors s
    JOIN users u ON u.user_id = s.user_id
    ${whereClause}
    `,
    params
  );

  const listParams = [...params, limit, offset];

  const result = await query(
    `
    SELECT
      s.sup_id,
      s.user_id,
      s.created_at AS supervisor_created_at,
      u.national_code,
      u.first_name,
      u.last_name,
      u.phone,
      u.birth_date,
      u.province,
      u.city,
      u.is_active,
      u.created_at AS user_created_at,
      COUNT(d.dis_id)::int AS disabled_count
    FROM supervisors s
    JOIN users u ON u.user_id = s.user_id
    LEFT JOIN disabled d ON d.sup_id = s.sup_id
    ${whereClause}
    GROUP BY
      s.sup_id,
      s.user_id,
      s.created_at,
      u.national_code,
      u.first_name,
      u.last_name,
      u.phone,
      u.birth_date,
      u.province,
      u.city,
      u.is_active,
      u.created_at
    ORDER BY s.created_at DESC, s.sup_id DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `,
    listParams
  );

  return {
    supervisors: result.rows,
    total: countResult.rows[0].total
  };
};
