// Clerk removed. Simple stub for admin check — replace with JWT-based check later.
const adminIds = [
    // legacy admin ids if needed
];

export const isAdmin = () => {
    // TODO: implement server-side JWT validation to determine userId
    // For now allow access to simplify migration; tighten later.
    return true;
};