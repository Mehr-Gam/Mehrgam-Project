import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => {
  return (req, res, next) => {
    //Zod is checking
    const result = schema.safeParse({
  body: req.body ?? {},
  params: req.params ?? {},
  query: req.query ?? {}
});

    if (!result.success) {
      const fields = {};

      for (const issue of result.error.issues) {
        const path = issue.path.join('.');

        if (!fields[path]) {
          fields[path] = [];
        }

        fields[path].push(issue.message);
      }

      return next(new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', fields));
    }

    req.validated = result.data;
    next();
  };
};
