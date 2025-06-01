"use client"

import { useState } from "react"
import OtpLogin from "@/components/otp-login/otp-login"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    return (
        <>
            {!isLoggedIn ? (
                <OtpLogin onSuccess={() => setIsLoggedIn(true)} />
            ) : (
                <main>{children}</main>
            )}
        </>
    )
}