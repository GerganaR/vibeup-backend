// import { Request, Response } from "express";
// import { authService } from "../services/auth.service";
// import { User } from "@/models/User.model";

// /**
//  * Controller layer for authentication
//  * Handles HTTP requests and responses
//  */
// export class AuthController {
//   /**
//    * Handle Google OAuth callback
//    * POST /api/auth/oauth/callback
//    */
//   async googleOAuthCallback(req: Request, res: Response): Promise<Response> {
//     try {
//       const { token, provider } = req.body;

//       // Validate provider
//       if (provider !== "google") {
//         return res.status(400).json({ message: "Unsupported provider" });
//       }

//       // Validate token
//       if (!token) {
//         return res.status(400).json({ message: "Token is required" });
//       }

//       // Authenticate with Google
//       const result = await authService.googleLogin(token);

//       // Return successful response
//       return res.json({
//         token: result.token,
//         refreshToken: result.refreshToken,
//         user: {
//           id: result.user.id,
//           email: result.user.email,
//           name: result.user.name,
//           picture: result.user.avatarUrl,
//         },
//       });
//     } catch (err: any) {
//       return res.status(400).json({ message: err.message });
//     }
//   }

//   /**
//    * Get current authenticated user
//    * GET /api/auth/user
//    */
//   async getCurrentUser(req: Request, res: Response): Promise<Response> {
//     try {
//       const user = req.user as User;

//       if (!user) {
//         return res.status(401).json({ message: "Not authenticated" });
//       }

//       return res.json({
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         picture: user.avatarUrl,
//       });
//     } catch (err: any) {
//       return res.status(500).json({ message: err.message });
//     }
//   }

//   /**
//    * Refresh access token
//    * POST /api/auth/refresh
//    */
//   async refreshToken(req: Request, res: Response): Promise<Response> {
//     try {
//       const { refreshToken } = req.body;

//       // Validate refresh token
//       if (!refreshToken) {
//         return res.status(400).json({ message: "Refresh token is required" });
//       }

//       // Generate new tokens
//       const tokens = await authService.refreshAccessToken(refreshToken);

//       return res.json({
//         token: tokens.token,
//         refreshToken: tokens.refreshToken,
//       });
//     } catch (err: any) {
//       return res.status(401).json({ message: "Invalid refresh token" });
//     }
//   }

//   /**
//    * Logout user
//    * POST /api/auth/logout
//    */
//   async logout(_req: Request, res: Response): Promise<Response> {
//     try {
//       // For stateless JWT, client should discard tokens
//       // In the future, we could implement token blacklisting here
//       return res.json({ message: "Logged out successfully" });
//     } catch (err: any) {
//       return res.status(500).json({ message: err.message });
//     }
//   }
// }

// // Export singleton instance
// export const authController = new AuthController();
