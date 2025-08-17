// middleware/permissionMiddleware.js
import { getFilePermissions } from "../models/sharing.model.js";
import supabase from "../config/supabaseClient.js";

export const checkPermission = (requiredRoles) => {
  return async (req, res, next) => {
    const { fileId } = req.params;
    const userId = req.user;

     // 1. Check ownership
    const { data: fileData, error } = await supabase
      .from("files")
      .select("user_id")
      .eq("id", fileId)
      .single();

    if (error) {
      return res.status(404).json({ message: "File not found" });
    }

    if (fileData.user_id === userId) {
      return next(); // ✅ Owner always has access
    }

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
