import { query } from '../../config/db.js';

const buildSearchClause = ({ search, params }) => {
  if (!search) {
    return '';
  }

  params.push(`%${search.toLowerCase()}%`);
  const paramIndex = params.length;

  return `
    AND (
      LOWER(u.national_code) LIKE $${paramIndex}
      OR LOWER(u.first_name) LIKE $${paramIndex}
      OR LOWER(u.last_name) LIKE $${paramIndex}
      OR LOWER(u.phone) LIKE $${paramIndex}
      OR LOWER(u.city) LIKE $${paramIndex}
      OR LOWER(u.province) LIKE $${paramIndex}
      OR LOWER(d.home_address) LIKE $${paramIndex}
      OR LOWER(d.accessibility_need) LIKE $${paramIndex}
    )
  `;
};

const disabledSelect = `
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
    u.created_at AS user_created_at
  FROM disabled d
  JOIN users u ON u.user_id = d.user_id
`;

export const findDisabledBySupervisor = async ({ supId, search, limit, offset }) => {
  const params = [supId];
  let whereClause = 'WHERE d.sup_id = $1';

  whereClause += buildSearchClause({ search, params });

  const countResult = await query(
    `
    SELECT COUNT(*)::int AS total
    FROM disabled d
    JOIN users u ON u.user_id = d.user_id
    ${whereClause}
    `,
    params
  );

  const listParams = [...params, limit, offset];

  const result = await query(
    `
    ${disabledSelect}
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

export const findDisabledByNationalCode = async (nationalCode) => {
  const result = await query(
    `
    ${disabledSelect}
    WHERE u.national_code = $1
      AND u.role = 'disabled'
    LIMIT 1
    `,
    [nationalCode]
  );

  return result.rows[0] || null;
};

export const findDisabledById = async (disId) => {
  const result = await query(
    `
    ${disabledSelect}
    WHERE d.dis_id = $1
    LIMIT 1
    `,
    [disId]
  );

  return result.rows[0] || null;
};

export const assignDisabledToSupervisor = async ({ disId, supId }) => {
  const result = await query(
    `
    UPDATE disabled
    SET sup_id = $1
    WHERE dis_id = $2
      AND sup_id IS NULL
    RETURNING dis_id
    `,
    [supId, disId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return findDisabledById(disId);
};

export const removeDisabledFromSupervisor = async ({ disId, supId }) => {
  const result = await query(
    `
    UPDATE disabled
    SET sup_id = NULL
    WHERE dis_id = $1
      AND sup_id = $2
    RETURNING dis_id
    `,
    [disId, supId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return findDisabledById(disId);
};
