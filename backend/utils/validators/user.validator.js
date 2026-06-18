const z = require('zod')

const registerSchema = z.object({
    username: z.string()
        .trim()
        .toLowerCase()
        .min(3)
        .regex(
        /^([a-z.]{3,})$/,
        'Invalid username'
        ),

    email: z.string()
        .trim()
        .toLowerCase()
        .email('Invalid email'),

    first_name: z.string()
        .trim()
        .min(3, 'First name is required')
        .regex(/^[a-zA-Z]+$/, 'First name must contain only letters'),

    last_name: z.string()
        .trim()
        .min(3, 'Last name is required')
        .regex(/^[a-zA-Z]+$/, 'Last name must contain only letters'),

    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),

    repassword: z.string().min(8),
});

const updateUserSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .email('Invalid email')
        .optional(),

    username: z.string()
        .trim()
        .toLowerCase()
        .min(3)
        .regex(
        /^([a-z.]{3,})$/,
        'Invalid username'
        )
        .optional(),

    first_name: z.string()
        .trim()
        .regex(/^[a-zA-Z]+$/, 'First name must contain only letters')
        .optional(),

    last_name: z.string()
        .trim()
        .regex(/^[a-zA-Z]+$/, 'Last name must contain only letters')
        .optional(),

    preferred_language: z.string()
        .trim()
        .optional(),
});


module.exports = {registerSchema, updateUserSchema}