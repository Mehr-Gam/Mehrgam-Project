import dotenv from 'dotenv';
import argon2 from 'argon2';

import { pool } from '../src/config/db.js';
import { isValidNationalCode } from '../src/utils/nationalCode.js';

dotenv.config();

const requiredEnv = (key) => {
    const value = process.env[key];

    if (!value || !String(value).trim()) {
        throw new Error(`${key} is required`);
    }

    return String(value).trim();
};

const validateAdminInput = ({
    nationalCode,
    firstName,
    lastName,
    phone,
    password
}) => {
    if (!/^\d{10}$/.test(nationalCode) || !isValidNationalCode(nationalCode)) {
        throw new Error('ADMIN_NATIONAL_CODE is invalid');
    }

    if (firstName.length < 2 || firstName.length > 50) {
        throw new Error('ADMIN_FIRST_NAME must be between 2 and 50 characters');
    }

    if (lastName.length < 2 || lastName.length > 50) {
        throw new Error('ADMIN_LAST_NAME must be between 2 and 50 characters');
    }

    if (!/^09[0-9]{9}$/.test(phone)) {
        throw new Error('ADMIN_PHONE must be a valid Iranian mobile number');
    }

    if (password.length < 6) {
        throw new Error('ADMIN_PASSWORD must be at least 6 characters');
    }
};

const createAdminOnce = async () => {
    const adminData = {
        nationalCode: requiredEnv('ADMIN_NATIONAL_CODE'),
        firstName: requiredEnv('ADMIN_FIRST_NAME'),
        lastName: requiredEnv('ADMIN_LAST_NAME'),
        phone: requiredEnv('ADMIN_PHONE'),
        password: requiredEnv('ADMIN_PASSWORD'),
        birthDate: process.env.ADMIN_BIRTH_DATE?.trim() || null,
        province: process.env.ADMIN_PROVINCE?.trim() || null,
        city: process.env.ADMIN_CITY?.trim() || null
    };

    validateAdminInput(adminData);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existingAdminResult = await client.query(
            `
      SELECT user_id, national_code, phone
      FROM users
      WHERE role = 'admin'
      LIMIT 1
      `
        );

        if (existingAdminResult.rows.length > 0) {
            const admin = existingAdminResult.rows[0];

            console.log('Admin already exists. No new admin was created.');
            console.log({
                userId: admin.user_id,
                nationalCode: admin.national_code,
                phone: admin.phone
            });

            await client.query('COMMIT');
            return;
        }

        const duplicateUserResult = await client.query(
            `
      SELECT user_id, national_code, phone, role
      FROM users
      WHERE national_code = $1 OR phone = $2
      LIMIT 1
      `,
            [adminData.nationalCode, adminData.phone]
        );

        if (duplicateUserResult.rows.length > 0) {
            const user = duplicateUserResult.rows[0];

            throw new Error(
                `A user with this national code or phone already exists. user_id=${user.user_id}, role=${user.role}`
            );
        }

        const passwordHash = await argon2.hash(adminData.password);

        const insertResult = await client.query(
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'admin')
      RETURNING
        user_id,
        national_code,
        first_name,
        last_name,
        phone,
        role,
        is_active,
        created_at
      `,
            [
                adminData.nationalCode,
                adminData.firstName,
                adminData.lastName,
                adminData.phone,
                adminData.birthDate,
                adminData.province,
                adminData.city,
                passwordHash
            ]
        );

        await client.query('COMMIT');

        console.log('Admin created successfully.');
        console.log(insertResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to create admin.');
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
};

createAdminOnce();