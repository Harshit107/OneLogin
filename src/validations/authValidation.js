const { z } = require("zod");

const register = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters string"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(7, "Password must be at least 7 characters long"),
    phone: z.number().optional(),
    userImage: z.string().url("Must be a valid URL").optional()
  })
});

const login = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
});

const emailOnly = z.object({
  body: z.object({
    email: z.string().email("Invalid email format")
  })
});

module.exports = {
  register,
  login,
  emailOnly
};
