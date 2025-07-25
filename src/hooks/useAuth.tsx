import { useEffect, useState } from "react";
import { GetSessionData } from "../services/AuthService";

const adminOnlyEndpoints = [
    "/admin_start",

    // test editing endpoints
    "/tests/edit",  // Adding the test edit route as admin-only
    "/test-edit",
    "/test-create",
    "/test-remove-tfp",

    // webinar management endpoints
    "webinars/edit"
    // todo: add rest of admin-only endpoints here
];

export function useAuth(currentPath: string) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        GetSessionData()
            .then(res => {
                if (!isMounted) return;

                if (!res || !res.is_logged_in) {
                    // console.log("User is not authenticated", res);
                    setIsAuthenticated(false);
                    setRedirectPath("/login"); // todo: redirect to the landing page in the future
                    return;
                }

                setIsAuthenticated(true);
                setIsAdmin(res.is_admin || false);

                // Redirect non-admin users from restricted pages
                if (!res.is_admin && adminOnlyEndpoints.includes(currentPath)) {
                    setRedirectPath("/");
                }
            })
            .catch(() => {
                if (isMounted) {
                    setIsAuthenticated(false);
                    setRedirectPath("/");
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false; // Prevent state updates after unmount
        };
    }, [currentPath]);

    return { isAuthenticated, isAdmin, isLoading, redirectPath };
}
