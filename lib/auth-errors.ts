/** Map NextAuth error codes to user-friendly messages */
export function getAuthErrorMessage(error?: string | null): string {
  switch (error) {
    case "CredentialsSignin":
      return "Invalid email or password. Please check your credentials or sign up.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthAccountNotLinked":
      return "Google sign-in failed. Please try again or use email and password.";
    case "AccessDenied":
      return "Access denied. You do not have permission to sign in.";
    case "Configuration":
      return "Sign-in is temporarily unavailable. Please try again later.";
    default:
      return "Unable to sign in. Please try again.";
  }
}
