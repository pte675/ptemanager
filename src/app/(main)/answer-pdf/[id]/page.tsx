import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

const pdfGroups = {
    reading: [
        {
            id: "reading-1",
            title: "PTE Reading 1 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/k8d3hkrt11rw5yax2lyxi/PTE-READING-1-ANSWERS.pdf?rlkey=05vngmhgcut0qslbg2uwowa9w&st=7docmjpf&raw=1",
        },
        {
            id: "reading-2",
            title: "PTE Reading 2 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/2qx6yk35urzeedyzm0ahu/PTE-READING-2-ANSWERS.pdf?rlkey=d8puz8s9mj3mmienj2sc8si9r&st=97tmqxx9&raw=1",
        },
        {
            id: "reading-3",
            title: "PTE Reading 3 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/5nhpdvxgejb32e1j1bpl1/PTE-READING-3-ANSWERS.pdf?rlkey=awspr7xcvzxfkguth7xe27f33&st=yccz298x&raw=1",
        },
        {
            id: "reading-4",
            title: "PTE Reading 4 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/aeruzw0d5gtbsysffq1hs/PTE-READING-4-ANSWERS.pdf?rlkey=xex6ymq2whzfa4yi6y1oi4rt4&st=s3u1zeu1&raw=1",
        },
        {
            id: "reading-5",
            title: "PTE Reading 5 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/lhql78mnbp3y93czms68u/PTE-READING-5-ANSWERS.pdf?rlkey=7hju0jafqq7ruepbd3omx88bc&st=5mvkpw8u&raw=1",
        },
        {
            id: "reading-6",
            title: "PTE Reading 6 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/p0eyhh4ifseaadf8o0nsn/PTE-READING-6-ANSWERS.pdf?rlkey=56i2yvqdk9i2nmjzq8c2fdtrp&st=j2uam6uq&raw=1",
        },
        // ... add up to 20
    ],
    // listening: [
    //     {
    //         id: "listening-1",
    //         title: "PTE Listening 1 – Answer PDF",
    //         url: "https://example.com/listening-1.pdf",
    //     },
    // ],
    // speaking: [
    //     {
    //         id: "speaking-1",
    //         title: "PTE Speaking 1 – Answer PDF",
    //         url: "https://example.com/speaking-1.pdf",
    //     },
    // ],
    // writing: [
    //     {
    //         id: "writing-1",
    //         title: "PTE Writing 1 – Answer PDF",
    //         url: "https://example.com/writing-1.pdf",
    //     },
    // ],
}

// Flatten the PDF groups into a single map for easy access
const pdfMap: Record<string, { title: string; url: string }> = {}
Object.values(pdfGroups).flat().forEach((pdf) => {
    pdfMap[pdf.id] = { title: pdf.title, url: pdf.url }
})

export default function AnswerPDFPage({ params }: { params: { id: string } }) {
    const pdf = pdfMap[params.id]

    if (!pdf) return notFound()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            {/* Header / Promotion */}
            <div className="bg-violet-600 text-white py-4 px-6 shadow-md">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <h1 className="text-lg font-bold">{pdf.title}</h1>
                    <Link href="/practice-questions">
                        <Button className="bg-white text-violet-700 hover:bg-violet-100">
                            Try Free PTE Mock Test
                        </Button>
                    </Link>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-auto">
                <object
                    data={pdf.url}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    style={{ minHeight: "calc(100vh - 64px)", border: "none" }}
                >
                    <p className="p-4 text-center">
                        PDF cannot be displayed.
                        <a href={pdf.url} target="_blank" className="underline text-violet-600">
                            Click here to open it.
                        </a>
                    </p>
                </object>
            </div>

            {/* Footer */}
            <footer className="bg-slate-100 text-center text-sm py-3 text-gray-600">
                © {new Date().getFullYear()} PTE Go Global — Improve your score with AI-powered practice.
            </footer>
        </div>
    )
}