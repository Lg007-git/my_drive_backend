// middleware/permissionMiddleware.js
import { getFilePermissions } from "../models/sharing.model.js";

export const checkPermission = (requiredRoles) => {
  return async (req, res, next) => {
    const { fileId } = req.params;
    const userId = req.user;

    const permissions = await getFilePermissions(fileId, userId);
    if (!permissions || permissions.length === 0) {
      return res.status(403).json({ message: "No access" });
    }

    const hasPermission = permissions.some((p) =>
      requiredRoles.includes(p.role)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};
