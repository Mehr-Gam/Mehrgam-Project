import { pool, query } from '../../config/db.js';

export const findUserByNationalCode = async (nationalCode) => {
  const result = await query(
    `
    SELECT
      u.user_id,
      u.national_code,
      u.first_name,
      u.last_name,
      u.phone,
      u.password_hash,
      u.role,
      u.is_active,
      d.dis_id,
      s.sup_id,
      v.vol_id,
      v.verification_status,
      v.is_online,
      v.current_lat,
      v.current_lng,
      v.location_updated_at
    FROM users u
    LEFT JOIN disabled d ON d.user_id = u.user_id
    LEFT JOIN supervisors s ON s.user_id = u.user_id
    LEFT JOIN volunteers v ON v.user_id = u.user_id
    WHERE u.national_code = $1
    LIMIT 1
    `,
    [nationalCode]
  );

  return result.rows[0] || null;
};

export const findUserByPhone = async (phone) => {
  const result = await query(
    `
    SELECT user_id
    FROM users
    WHERE phone = $1
    LIMIT 1
    `,
    [phone]
  );

  return result.rows[0] || null;
};

export const findUserById = async (userId) => {
  const result = await query(
    `
    SELECT
      u.user_id,
      u.national_code,
      u.first_name,
      u.last_name,
      u.phone,
      u.role,
      u.is_active,
      d.dis_id,
      s.sup_id,
      v.vol_id,
      v.verification_status,
      v.is_online,
      v.current_lat,
      v.current_lng,
      v.location_updated_at
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

export const createUserWithProfile = async ({
  nationalCode,
  firstName,
  lastName,
  phone,
  birthDate,
  province,
  city,
  passwordHash,
  role,
  homeAddress,
  accessibilityNeed
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
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
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING user_id
      `,
      [
        nationalCode,
        firstName,
        lastName,
        phone,
        birthDate || null,
        province || null,
        city || null,
        passwordHash,
        role
      ]
    );

    const userId = userResult.rows[0].user_id;

    if (role === 'supervisor') {
      await client.query(
        `
        INSERT INTO supervisors (user_id)
        VALUES ($1)
        `,
        [userId]
      );
    }

    if (role === 'disabled') {
      await client.query(
        `
        INSERT INTO disabled (
          user_id,
          accessibility_need,
          home_address
        )
        VALUES ($1, $2, $3)
        `,
        [
          userId,
          accessibilityNeed || null,
          homeAddress
        ]
      );
    }

    if (role === 'volunteer') {
      await client.query(
        `
        INSERT INTO volunteers (
          user_id,
          home_address
        )
        VALUES ($1, $2)
        `,
        [
          userId,
          homeAddress
        ]
      );
    }

    await client.query('COMMIT');

    return findUserById(userId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const saveRefreshToken = async ({
  userId,
  tokenHash,
  expiresAt,
  userAgent,
  ipAddress
}) => {
  const result = await query(
    `
    INSERT INTO refresh_tokens (
      user_id,
      token_hash,
      expires_at,
      user_agent,
      ip_address
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING token_id
    `,
    [userId, tokenHash, expiresAt, userAgent, ipAddress]
  );

  return result.rows[0];
};

export const findRefreshToken = async (tokenHash) => {
  const result = await query(
    `
    SELECT
      token_id,
      user_id,
      token_hash,
      expires_at,
      revoked_at
    FROM refresh_tokens
    WHERE token_hash = $1
    LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] || null;
};

export const revokeRefreshToken = async (tokenHash) => {
  await query(
    `
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE token_hash = $1
    `,
    [tokenHash]
  );
};
