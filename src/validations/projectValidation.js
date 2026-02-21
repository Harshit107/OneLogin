const { z } = require("zod");

const createProject = z.object({
  body: z.object({
    name: z.string().min(1, "Project name is required").trim()
  })
});

const getProject = z.object({
  body: z.object({
    projectId: z.string().min(1, "Project ID is required").trim()
  })
});

const updateProject = z.object({
  body: z.object({
    projectId: z.string().min(1, "Project ID is required").trim(),
    name: z.string().trim().optional(),
    email: z.string().email("Invalid email format").optional(),
    maintenance: z.boolean().optional(),
    verification: z.boolean().optional()
  }).refine(data => Object.keys(data).length > 1, {
    message: "Provide at least one property to update (name, email, maintenance, verification)",
    path: ["body"]
  })
});

module.exports = {
  createProject,
  getProject,
  updateProject
};
