"use client"

import type * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Timer, CheckCircle, Sparkles, Smartphone, Shield, ProjectorIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { allCountries } from 'country-telephone-data'

type Step = "phone" | "verify" | "success"

type CountryData = {
    code: string;
    country: string;
    flag: string;
    name: string;
};

export const countryCodes: CountryData[] = allCountries.map((country: any) => ({
    code: `+${country.dialCode}`,
    country: country.iso2.toUpperCase(),
    flag: String.fromCodePoint(
        ...[...country.iso2.toUpperCase()].map((c: string) => 0x1f1e6 - 65 + c.charCodeAt(0))
    ),
    name: country.name,
}));

const uniqueCountryCodes: CountryData[] = Array.from(
    new Map(countryCodes.map((item) => [item.code, item])).values()
);

export default function OtpLogin({ onSuccess }: { onSuccess: () => void }) {
    const [step, setStep] = useState<Step>("phone")
    const [countryCode, setCountryCode] = useState("+1")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [otp, setOtp] = useState(["", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [resendTimer, setResendTimer] = useState(0)
    const [error, setError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [showSuccessCheck, setShowSuccessCheck] = useState(false)

    const otpRefs = useRef<(HTMLInputElement | null)[]>([])
    const phoneInputRef = useRef<HTMLInputElement>(null)

    const [generatedOtp, setGeneratedOtp] = useState("")

    //automatically get country code for phone number
    useEffect(() => {
        const fetchCountryCode = async () => {
            try {
                const res = await fetch("https://ipapi.co/json/");
                const data = await res.json();
                const phoneCode = data.country_calling_code; // e.g. "+91"
                console.log(phoneCode)

                setCountryCode(phoneCode || "+1"); // fallback to +1 if not found
            } catch (error) {
                console.error("Country auto-detection failed:", error);
                setCountryCode("+1"); // fallback
            }
        };

        fetchCountryCode();
    }, []);

    useEffect(() => {
        if (step === "phone") {
            setTimeout(() => phoneInputRef.current?.focus(), 500)
        }
    }, [step])

    // Timer for resend functionality
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendTimer])

    // Auto-paste functionality
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (step !== "verify") return

            const pastedData = e.clipboardData?.getData("text")
            if (pastedData && /^\d{6}$/.test(pastedData)) {
                const digits = pastedData.split("")
                setOtp(digits)
                otpRefs.current[5]?.focus()
            }
        }

        document.addEventListener("paste", handlePaste)
        return () => document.removeEventListener("paste", handlePaste)
    }, [step])

    // Check if all digits are filled and auto submit otp
    useEffect(() => {
        if (otp.every((digit) => digit)) {
            const timeout = setTimeout(() => handleVerifyCode(), 300)
            return () => clearTimeout(timeout)
        }
    }, [otp])

    const handleSendCode = async () => {
        setError("")
        setIsLoading(true)

        try {
            // ✅ Generate 4-digit random OTP and store in a const
            const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString()
            setGeneratedOtp(generatedOtp)

            const fullNumber = countryCode.replace("+", "") + phoneNumber
            const res = await fetch("/api/whapi/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: fullNumber,
                    generatedOtp: generatedOtp,
                }),
            })

            if (!res.ok) throw new Error("Failed to send OTP")

            setStep("verify")
            setResendTimer(60)
            setTimeout(() => otpRefs.current[0]?.focus(), 600)
        } catch (err: any) {
            // setError("Could not send OTP. Try again.");

            //if whapi failed to send otp

            toast("OTP services are under maintenance. Will be fixed within 24 hours. Enjoy free login for now 🎉")

            setIsSuccess(true)
            setShowSuccessCheck(true)

            setTimeout(() => {
                setStep("success")
                onSuccess?.()
            }, 1200)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)

        // Auto-advance to next input
        if (value && index < otp.length - 1) {
            setTimeout(() => otpRefs.current[index + 1]?.focus(), 10)
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            setTimeout(() => otpRefs.current[index - 1]?.focus(), 10)
        }
    }

    const handleVerifyCode = async () => {
        if (otp.some((digit) => !digit)) {
            setError("Please enter the complete verification code")
            return
        }

        const enteredOtp = otp.join("")

        setError("")
        setIsLoading(true)

        await new Promise((resolve) => setTimeout(resolve, 500))

        if (enteredOtp === generatedOtp) {
            setIsSuccess(true)
            setShowSuccessCheck(true)

            setTimeout(() => {
                setStep("success")
                onSuccess?.()
            }, 1200)
        } else {
            setError("Invalid OTP. Please try again.")
        }

        setIsLoading(false)
    }

    const handleResendCode = async () => {
        setOtp(["", "", "", ""]) // ✅ correct for 4-digit OTP

        await handleSendCode()

        setResendTimer(60)
        setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }

    const formatPhoneNumber = (number: string) => {
        if (number.length <= 3) return number
        if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`
        return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 10)}`
    }

    const getSelectedCountry = () => {
        return countryCodes.find((c) => c.code === countryCode)
    }

    const containerVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    }

    const cardVariants = {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.98,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    }

    const contentVariants = {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    }

    const buttonVariants = {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.4,
                ease: [0.22, 1, 0.36, 1],
            },
        },
        exit: { opacity: 0, y: 10, transition: { duration: 0.3 } },
        hover: { scale: 1.03, transition: { duration: 0.2 } },
        tap: { scale: 0.98, transition: { duration: 0.1 } },
    }

    const iconVariants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 10,
                delay: 0.2,
            },
        },
        exit: { scale: 0.8, opacity: 0 },
    }

    const successIconVariants = {
        initial: { scale: 0, opacity: 0 },
        animate: {
            scale: [0, 1.2, 1],
            opacity: 1,
            transition: {
                duration: 0.6,
                times: [0, 0.6, 1],
                ease: "easeOut",
            },
        },
    }

    const sparkleVariants = {
        animate: {
            scale: [0.5, 1, 0.8, 1],
            opacity: [0, 1, 0.8, 1],
            transition: {
                duration: 2,
                delay: 0.5,
                repeat: Infinity,
                repeatType: "reverse" as const,
            },
        },
    }

    const floatingBubbleVariants = {
        animate: (custom: number) => ({
            y: [0, -15, 0],
            x: [0, custom, 0],
            opacity: [0.5, 0.8, 0.5],
            transition: {
                y: {
                    duration: 3 + custom,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                },
                x: {
                    duration: 5 + custom,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                },
                opacity: {
                    duration: 4 + custom,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                },
            },
        }),
    }

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                background:
                    "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.1) 25%, rgba(67, 56, 202, 0.05) 50%, rgba(0, 0, 0, 0) 100%), linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            }}
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute w-64 h-64 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0) 70%)",
                        top: "20%",
                        left: "15%",
                    }}
                    custom={1}
                    variants={floatingBubbleVariants}
                    animate="animate"
                />
                <motion.div
                    className="absolute w-96 h-96 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%)",
                        bottom: "10%",
                        right: "10%",
                    }}
                    custom={2}
                    variants={floatingBubbleVariants}
                    animate="animate"
                />
                <motion.div
                    className="absolute w-80 h-80 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0) 70%)",
                        top: "40%",
                        right: "25%",
                    }}
                    custom={1.5}
                    variants={floatingBubbleVariants}
                    animate="animate"
                />
            </div>

            <AnimatePresence mode="wait">
                {step === "success" ? (
                    <motion.div
                        key="success"
                        className="w-full max-w-md"
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <motion.div className="relative overflow-hidden rounded-3xl shadow-2xl" variants={cardVariants}>
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl" />
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                            <div className="relative z-10 px-8 py-12 text-center">
                                <motion.div
                                    className="relative w-28 h-28 mx-auto mb-8"
                                    variants={successIconVariants}
                                    initial="initial"
                                    animate="animate"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-30 blur-lg" />
                                    <div className="relative w-28 h-28 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-14 h-14 text-white" />
                                    </div>

                                    <motion.div className="absolute -top-2 -right-2" variants={sparkleVariants} animate="animate">
                                        <Sparkles className="w-6 h-6 text-yellow-300" />
                                    </motion.div>

                                    <motion.div
                                        className="absolute bottom-0 -left-4"
                                        variants={sparkleVariants}
                                        animate="animate"
                                        transition={{ delay: 0.5 }}
                                    >
                                        <Sparkles className="w-5 h-5 text-emerald-300" />
                                    </motion.div>
                                </motion.div>

                                <motion.h2
                                    className="text-3xl font-bold text-white mb-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.5 } }}
                                >
                                    Verification Complete
                                </motion.h2>

                                <motion.p
                                    className="text-emerald-100 text-lg mb-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5 } }}
                                >
                                    Your phone number has been successfully verified
                                </motion.p>

                                <motion.div
                                    variants={buttonVariants}
                                    initial="initial"
                                    animate="animate"
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <Button
                                        className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium text-lg rounded-xl border-0"
                                        onClick={() => {
                                            setStep("phone")
                                            setOtp(["", "", "", "", "", ""])
                                            setPhoneNumber("")
                                            setIsSuccess(false)
                                            setShowSuccessCheck(false)
                                        }}
                                    >
                                        Continue to Dashboard
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="auth"
                        className="w-full max-w-md"
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <motion.div className="relative overflow-hidden rounded-3xl shadow-2xl" variants={cardVariants}>
                            {/* Glass effect background */}
                            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl" />
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10" />
                            <div className="absolute inset-0 border border-white/10 rounded-3xl" />

                            {/* Subtle animated border */}
                            <div className="absolute inset-0 rounded-3xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 opacity-0 hover:opacity-10 transition-opacity duration-1000" />
                            </div>

                            <div className="relative z-10 px-8 pt-10 pb-10">
                                {/* Header */}
                                <div className="text-center mb-8 relative">
                                    {step === "verify" && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="absolute left-0 top-0"
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10"
                                                onClick={() => {
                                                    setStep("phone")
                                                    setOtp(["", "", "", "", "", ""])
                                                }}
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </Button>
                                        </motion.div>
                                    )}

                                    <motion.div
                                        className="relative w-20 h-20 mx-auto mb-6"
                                        variants={iconVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-30 blur-lg" />
                                        <div className="relative w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            {step === "phone" ? (
                                                <Smartphone className="w-10 h-10 text-white" />
                                            ) : (
                                                <Shield className="w-10 h-10 text-white" />
                                            )}
                                        </div>
                                    </motion.div>

                                    <motion.h2
                                        className="text-3xl font-bold text-white mb-2"
                                        variants={contentVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                    >
                                        {step === "phone" ? "Secure Login" : "Verification Code"}
                                    </motion.h2>

                                    <motion.p
                                        className="text-indigo-100/80 text-lg"
                                        variants={contentVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                    >
                                        {step === "phone"
                                            ? "Enter your phone number to continue"
                                            : `We've sent a code to ${getSelectedCountry()?.flag} ${countryCode} ${formatPhoneNumber(phoneNumber)}`}
                                    </motion.p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {step === "phone" ? (
                                        <motion.div
                                            key="phone-step"
                                            variants={contentVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className="space-y-8"
                                        >
                                            {/* Phone number input */}
                                            <div className="space-y-4">
                                                <div className="flex gap-3">
                                                    <Select value={countryCode} onValueChange={setCountryCode}>
                                                        <SelectTrigger className="w-32 h-14 bg-white/5 border-white/10 text-white backdrop-blur-sm hover:bg-white/10 transition-all duration-300 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-slate-700">
                                                            {uniqueCountryCodes.map((country) => (
                                                                <SelectItem
                                                                    key={country.code}
                                                                    value={country.code}
                                                                    className="text-white hover:bg-white/10 focus:bg-white/10 rounded-lg my-0.5"
                                                                >
                                                                    <span className="flex items-center gap-3">
                                                                        <span className="text-lg">{country.flag}</span>
                                                                        <span className="font-medium">{country.code}</span>
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    <Input
                                                        ref={phoneInputRef}
                                                        type="tel"
                                                        placeholder="Enter phone number"
                                                        value={formatPhoneNumber(phoneNumber)}
                                                        onChange={(e) => {
                                                            const cleaned = e.target.value.replace(/\D/g, "")
                                                            if (cleaned.length <= 10) {
                                                                setPhoneNumber(cleaned)
                                                            }
                                                        }}
                                                        className="flex-1 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 backdrop-blur-sm focus:bg-white/10 transition-all duration-300 text-lg rounded-xl"
                                                        maxLength={12}
                                                    />
                                                </div>

                                                {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                                                    <motion.p
                                                        className="text-red-300 text-sm"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        Please enter a valid 10-digit phone number
                                                    </motion.p>
                                                )}
                                            </div>

                                            <motion.div
                                                variants={buttonVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                whileHover="hover"
                                                whileTap="tap"
                                            >
                                                <Button
                                                    onClick={handleSendCode}
                                                    disabled={isLoading || phoneNumber.length < 10}
                                                    className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-lg rounded-xl border-0 shadow-lg shadow-indigo-500/20"
                                                >
                                                    {isLoading ? (
                                                        <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                            Sending Code...
                                                        </motion.div>
                                                    ) : (
                                                        "Send Verification Code"
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="verify-step"
                                            variants={contentVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className="space-y-8"
                                        >
                                            {/* OTP Input */}
                                            <div className="space-y-6">
                                                <div className="flex justify-center gap-3">
                                                    {otp.map((digit, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                                transition: {
                                                                    delay: 0.1 * index,
                                                                    duration: 0.4,
                                                                    ease: [0.22, 1, 0.36, 1],
                                                                },
                                                            }}
                                                        >
                                                            <Input
                                                                ref={(el) => {
                                                                    otpRefs.current[index] = el
                                                                }}
                                                                type="text"
                                                                inputMode="numeric"
                                                                maxLength={1}
                                                                value={digit}
                                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                                className={cn(
                                                                    "w-12 h-16 text-center text-2xl font-bold transition-all duration-300 bg-white/5 backdrop-blur-sm rounded-xl border-2",
                                                                    digit
                                                                        ? "border-indigo-400 bg-indigo-500/20 text-white shadow-lg"
                                                                        : "border-white/10 text-white/70 hover:border-indigo-400/30",
                                                                    error && "border-red-400 bg-red-500/10",
                                                                    isSuccess && "border-emerald-400 bg-emerald-500/20",
                                                                )}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {error && (
                                                    <motion.p
                                                        className="text-red-300 text-center font-medium"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        {error}
                                                    </motion.p>
                                                )}

                                                {/* Success check animation */}
                                                {showSuccessCheck && (
                                                    <motion.div
                                                        className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20 rounded-3xl"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{
                                                                scale: [0, 1.2, 1],
                                                                transition: {
                                                                    duration: 0.6,
                                                                    times: [0, 0.6, 1],
                                                                    ease: "easeOut",
                                                                },
                                                            }}
                                                            className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center"
                                                        >
                                                            <CheckCircle className="w-12 h-12 text-white" />
                                                        </motion.div>
                                                    </motion.div>
                                                )}

                                                {/* Resend section */}
                                                <div className="text-center space-y-3">
                                                    <p className="text-white/60">Didn't receive the code?</p>
                                                    {resendTimer > 0 ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-white/10 text-white/80 border-white/10 gap-2 px-4 py-2 rounded-full"
                                                        >
                                                            <Timer className="w-4 h-4" />
                                                            Resend in {resendTimer}s
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            variant="link"
                                                            onClick={handleResendCode}
                                                            disabled={isLoading}
                                                            className="text-indigo-300 hover:text-indigo-200 p-0 h-auto font-medium text-lg hover:underline transition-all duration-300"
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    Sending...
                                                                </>
                                                            ) : (
                                                                "Resend Code"
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <motion.div
                                                variants={buttonVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                whileHover="hover"
                                                whileTap="tap"
                                            >
                                                <Button
                                                    onClick={handleVerifyCode}
                                                    disabled={isLoading || otp.some((digit) => !digit)}
                                                    className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-lg rounded-xl border-0 shadow-lg shadow-indigo-500/20"
                                                >
                                                    {isLoading ? (
                                                        <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                            Verifying...
                                                        </motion.div>
                                                    ) : (
                                                        "Verify Code"
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
