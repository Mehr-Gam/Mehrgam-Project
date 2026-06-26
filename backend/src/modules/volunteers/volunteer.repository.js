import { query } from '../../config/db.js';

export const findVolunteerById = async (volId) => {
  const result = await query(
    `
    SELECT
      vol_id,
      user_id,
      home_address,
      current_lat,
      current_lng,
      location_updated_at,
      is_online,
      verification_status,
      verified_at,
      created_at
    FROM volunteers
    WHERE vol_id = $1
    LIMIT 1
    `,
    [volId]
  );

  return result.rows[0] || null;
};

export const updateVolunteerLocation = async ({ volId, currentLat, currentLng }) => {
  const result = await query(
    `
    UPDATE volunteers
    SET
      current_lat = $1,
      current_lng = $2,
      location_updated_at = CURRENT_TIMESTAMP,
      is_online = TRUE
    WHERE vol_id = $3
    RETURNING
      vol_id,
      current_lat,
      current_lng,
      location_updated_at,
      is_online
    `,
    [currentLat, currentLng, volId]
  );

  return result.rows[0] || null;
};

export const setVolunteerOnlineStatus = async ({ volId, isOnline }) => {
  const result = await query(
    `
    UPDATE volunteers
    SET is_online = $1
    WHERE vol_id = $2
    RETURNING
      vol_id,
      current_lat,
      current_lng,
      location_updated_at,
      is_online
    `,
    [isOnline, volId]
  );

  return result.rows[0] || null;
};

export const createAvailability = async ({ volId, weekday, startTime, endTime }) => {
  const result = await query(
    `
    INSERT INTO volunteer_availability (
      vol_id,
      weekday,
      start_time,
      end_time
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      avail_id,
      vol_id,
      weekday,
      start_time,
      end_time,
      is_active,
      created_at
    `,
    [volId, weekday, startTime, endTime]
  );

  return result.rows[0];
};

export const findAvailabilityByVolunteer = async (volId) => {
  const result = await query(
    `
    SELECT
      avail_id,
      vol_id,
      weekday,
      start_time,
      end_time,
      is_active,
      created_at
    FROM volunteer_availability
    WHERE vol_id = $1
    ORDER BY weekday ASC, start_time ASC
    `,
    [volId]
  );

  return result.rows;
};

export const activateAvailability = async ({ volId, availId }) => {
  const result = await query(
    `
    UPDATE volunteer_availability
    SET is_active = TRUE
    WHERE avail_id = $1
      AND vol_id = $2
    RETURNING
      avail_id,
      vol_id,
      weekday,
      start_time,
      end_time,
      is_active,
      created_at
    `,
    [availId, volId]
  );

  return result.rows[0] || null;
};

export const deactivateAvailability = async ({ volId, availId }) => {
  const result = await query(
    `
    UPDATE volunteer_availability
    SET is_active = FALSE
    WHERE avail_id = $1
      AND vol_id = $2
    RETURNING
      avail_id,
      vol_id,
      weekday,
      start_time,
      end_time,
      is_active,
      created_at
    `,
    [availId, volId]
  );

  return result.rows[0] || null;
};

export const deleteAvailability = async ({ volId, availId }) => {
  const result = await query(
    `
    DELETE FROM volunteer_availability
    WHERE avail_id = $1
      AND vol_id = $2
    RETURNING
      avail_id,
      vol_id,
      weekday,
      start_time,
      end_time,
      is_active,
      created_at
    `,
    [availId, volId]
  );

  return result.rows[0] || null;
};
