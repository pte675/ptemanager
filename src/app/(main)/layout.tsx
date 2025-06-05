"use client"

import { use, useEffect, useState } from "react"
import OtpLogin from "@/components/otp-login/otp-login"
import { loginWithPhone, updateCompressedData } from "@/lib/superbase/login"
import CryptoJS from 'crypto-js'
import { inflate, deflate } from 'pako';
import { toast } from "sonner"

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(true)
    const [userPhone, setUserPhone] = useState<string | null>(null)
    const [backup_localstorage, setBackupLocalstorage] = useState<string | null>(null)

    const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY!

    // Revert back if user change localStorage manually for `user_phone`
    useEffect(() => {
        const interval = setInterval(() => {
            const current = localStorage.getItem("user_phone")
            if (current !== backup_localstorage) {
                if (backup_localstorage && backup_localstorage.length > 3) {
                    localStorage.setItem("user_phone", backup_localstorage)
                } else {
                    localStorage.removeItem("user_phone")
                }
            }
        }, 500)

        return () => clearInterval(interval)
    }, [backup_localstorage])

    // ✅ Run on page load — check localStorage - check if user is logged in already on same device
    useEffect(() => {
        const stored = localStorage.getItem("user_phone")
        if (stored && stored.length > 3) {
            setIsLoggedIn(true)

            // store backup for reverting back manual changes
            setBackupLocalstorage(stored)
        } else {
            setIsLoggedIn(false)
        }
    }, [])

    // ✅ Run when userPhone is set from OTP - handle new login or returning user
    useEffect(() => {
        if (userPhone && userPhone.length > 3) {
            // Encrypt phone number before storing in localStorage
            const encryptedPhone = CryptoJS.AES.encrypt(userPhone, SECRET_KEY).toString()

            //upddate user_phone backup to check for manual localstorage changes
            setBackupLocalstorage(encryptedPhone)
            localStorage.setItem("user_phone", encryptedPhone)

            //store backup then login
            //async login and data handling
            const handleLogin = async () => {
                try {
                    const result = await loginWithPhone(userPhone);
                    if (!result.success) {
                        //phone not found or error
                        console.error("Login failed");
                    } else if (result.dataCompressed) {
                        //existing user with compressed data (for practice questions) - decompress and store in localStorage
                        console.log("Returning user. Compressed data:", result.dataCompressed);
                        try {
                            const binaryData = new Uint8Array(
                                atob(result.dataCompressed)
                                    .split("")
                                    .map((c) => c.charCodeAt(0))
                            );

                            const decompressed = inflate(binaryData, { to: "string" });
                            localStorage.setItem("progress", decompressed); // ✅ restore progress
                            console.log("Restored progress from DB:", JSON.parse(decompressed));
                        } catch (err) {
                            console.error("Decompression failed:", err);
                        }

                    } else {
                        //no data_compressed means new user
                        console.log("New user. No compressed data yet.");
                    }
                } catch (err) {
                    //superbase error
                    console.error("Unexpected login error:", err);
                }
            };

            void handleLogin();
        }
    }, [userPhone])

    // Load default progress on first visit
    useEffect(() => {
        const alreadySet = localStorage.getItem("progress")
        if (!alreadySet) {
            const defaultProgress = {
                listening: {
                    "fill-in-the-blanks": { completed: 0, accuracy: null, streak: 0 },
                    "highlight-correct-summary": { completed: 0, accuracy: null, streak: 0 },
                    "highlight-incorrect-words": { completed: 0, accuracy: null, streak: 0 },
                    "multiple-mcq": { completed: 0, accuracy: null, streak: 0 },
                    "single-mcq": { completed: 0, accuracy: null, streak: 0 },
                    "summarize-text-spoken": { completed: 0, accuracy: null, streak: 0 },
                    "writing-from-dictation": { completed: 0, accuracy: null, streak: 0 }
                },
                reading: {
                    "single-mcq": { completed: 0, accuracy: null, streak: 0 },
                    "multiple-mcq": { completed: 0, accuracy: null, streak: 0 },
                    "re-order": { completed: 0, accuracy: null, streak: 0 },
                    "fill-in-the-blanks": { completed: 0, accuracy: null, streak: 0 },
                    "reading-and-writing-fill-in-the-blanks": { completed: 0, accuracy: null, streak: 0 }
                },
                speaking: {
                    "read-aloud": { completed: 0, accuracy: null, streak: 0 },
                    "repeat-sentence": { completed: 0, accuracy: null, streak: 0 },
                    "describe-image": { completed: 0, accuracy: null, streak: 0 },
                    "retell-lecture": { completed: 0, accuracy: null, streak: 0 },
                    "short-answer-questions": { completed: 0, accuracy: null, streak: 0 }
                },
                writing: {
                    "essay-writing": { completed: 0, accuracy: null, streak: 0 },
                    "summarize-text": { completed: 0, accuracy: null, streak: 0 }
                }
            }

            localStorage.setItem("progress", JSON.stringify(defaultProgress))
        }
    }, [])

    // ✅ Run every 3 minutes to check for progress changes and update Supabase
    useEffect(() => {
        let previousProgress = localStorage.getItem("progress");
        const encryptedPhone = localStorage.getItem("user_phone");

        if (!encryptedPhone || encryptedPhone.length < 3) return;

        const decryptedPhone = CryptoJS.AES.decrypt(encryptedPhone, SECRET_KEY).toString(CryptoJS.enc.Utf8);

        const interval = setInterval(async () => {
            const current = localStorage.getItem("progress");

            if (current && current !== previousProgress) {
                try {
                    // parse and compare
                    const parsed = JSON.parse(current);
                    // console.log("📌 Progress changed:", parsed);

                    // compress
                    const compressed = deflate(current);
                    const base64 = btoa(String.fromCharCode(...compressed));

                    // update Supabase
                    const result = await updateCompressedData(decryptedPhone, base64);
                    if (result.success) {
                        // console.log("✅ Supabase updated with new progress.");
                        toast.success("Progress saved successfully", {
                            description: "Next save is in 3 mins",
                        });
                        previousProgress = current; // update reference
                    } else {
                        console.warn("⚠️ Failed to update Supabase.");
                    }
                } catch (err) {
                    console.error("Failed to process updated progress:", err);
                }
            }
        }, 180000); // every 3 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {!isLoggedIn ? (
                <OtpLogin
                    onSuccess={(phone: string | null) => {
                        setUserPhone(phone)
                        setIsLoggedIn(true)
                    }}
                />
            ) : (
                <main>{children}</main>
            )}
        </>

    )
}



// ✅ ALL UNIQUE LOGIN/SIGNUP CONDITIONS

// 1. First-time user on any device:
//    - Phone not in DB
//    - Enters phone → OTP verified
//    - Inserts phone into DB → signup
//    - Encrypts phone & saves in localStorage ✅
//    - if whapi not working - free login until new build
//    - if whapi working - OTP verification done send phone to layout and login

// 2. Returning user on the same device:
//    - Encrypted phone found in localStorage
//    - Auto login → skip OTP & DB call ⚡

// 3. Returning user on a different/new device:
//    - No localStorage
//    - Enters phone → OTP verified
//    - Phone already in DB → login
//    - Encrypts phone & saves in this device's localStorage ✅

// 4. Returning user on same device but manually cleared localStorage:
//    - No localStorage
//    - Enters phone → OTP verified
//    - Phone in DB → login
//    - Encrypts phone & saves in localStorage again ✅

// 5. User tries logging in with invalid/empty phone number:
//    - Rejected immediately → in otp verification phase ❌

// 6. User enters a valid phone, but OTP not verified or expired:
//    - Rejected immediately → in otp verification phase ❌

// 7. Phone already exists in DB but user tries to re-signup manually:
//    -cant resign up - no options to sign out ✅

// 8. User logs in from multiple devices independently:
//    - Each device manages its own encrypted phone in localStorage
//    - All devices can stay logged in independently ✅

// 9. User copies `localStorage` from one device to another:
//  - localStorage will check backup_localstorage and then revert back to the original value

// 10. User inspects and modifies localStorage manually in browser:
//     - Can replace `user_phone` with any encrypted string (or just random text)
//     - localStorage will check backup_localstorage and then revert back to the original value

// 11. User uses developer tools to bypass OTP UI:
//     -can cuz we are using isLoggedIn state to check if user is logged in and redering components accordingly

// 12. Malicious user brute-forces phone numbers (scripted OTP bypass):
//     - If there's no rate limiting or OTP verification check
//     - Can simulate fake users and flood Supabase or impersonate real users

// 13. User guesses or reverse-engineers AES-encrypted phone:
//     - If secret key is predictable or weak (e.g., `123abc`), they can decrypt and use other users' phones ⚠️

// 14. Someone intercepts unencrypted phone during login (e.g., on public Wi-Fi):
//     - If not using HTTPS, phone numbers can be sniffed in transit
//     - Leads to account takeover risk

// 15. User shares a phone number with others (shared devices or intentionally):
//     - Multiple users can impersonate one another if no secondary verification (e.g., OTP for every session)

// 16. User tries to log in with a banned phone number
// 	   - no bans

// 17. User logs in from too many devices (multi-device abuse)
// 	   - No limit on devices, but each device manages its own localStorage

// 18. Encrypted phone in localStorage is tampered/corrupted
// 	   - backup_localstorage will restore the original value

// 19. Phone number changes format (with/without country code)
// 	   - becomes a seperate phone number in the database

// 20. OTP re-verification after 30 days
// 	   - No automatic re-verification

// 21. Auto-expire old localStorage phone data
// 	   - No auto-expiration, relies on user clearing localStorage manually