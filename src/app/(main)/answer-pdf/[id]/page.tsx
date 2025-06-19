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
        {
            id: "reading-7",
            title: "PTE Reading 7 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/lzw73c1ynkxi76ncapcfa/PTE-READING-7-ANSWERS.pdf?rlkey=3kq3pk7idqdu19r0aubstdhrz&st=t958nev6&raw=1",
        },
        {
            id: "reading-8",
            title: "PTE Reading 8 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/kxxijhrkr8xeiycbpwfzk/PTE-READING-8-ANSWERS.pdf?rlkey=w6ljmkszgegez6f7so3ly4kt9&st=7o5b441o&raw=1",
        },
        {
            id: "reading-9",
            title: "PTE Reading 9 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/cm7xfamphp35bktqq1x3l/PTE-READING-9-ANSWERS.pdf?rlkey=asaszubuae48mgiko22pm0cum&st=nxaejafa&raw=1",
        },
        // ... add up to 20
    ],
    listening: [
        {
            id: "listening-1",
            title: "PTE Listening 1 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/czxnekfmmytj2gt9u0irx/Listening-1-Ans.pdf?rlkey=hixpovd04k1afbqr0suh67hck&st=qhdm0opp&raw=1",
        },
        {
            id: "listening-2",
            title: "PTE Listening 2 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/xz5okpfflgfpa7ivbiozc/Listening-2-Ans.pdf?rlkey=mtpve7q0mhkn910h8kj2bls85&st=c9coueoa&raw=1",
        },
        {
            id: "listening-3",
            title: "PTE Listening 3 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/svdmr0gyybla2uewtrpwr/Listening-3-Ans.pdf?rlkey=ajpzm2pbk5z677hyacdke533j&st=wsa3dn03&raw=1",
        },
        {
            id: "listening-4",
            title: "PTE Listening 4 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/r6o3mftc0usbihtid6agr/Listening-4-Ans.pdf?rlkey=zgqq1dm92calslayod9l48y6v&st=f5w7jvzd&raw=1",
        },
        {
            id: "listening-5",
            title: "PTE Listening 5 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/x74jziz0n3e7qbvwttosg/Listening-5-Ans.pdf?rlkey=mff941k1xgu9qxfift98wxxi5&st=r3m7khtw&raw=1",
        },
        {
            id: "listening-6",
            title: "PTE Listening 6 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/jaj4fr4vyq95k33g7srqq/Listening-6-Ans.pdf?rlkey=kct5t11ds0z3reh8ninvo94kh&st=i1duo9c2&raw=1",
        },
        {
            id: "listening-7",
            title: "PTE Listening 7 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/oksknxanm8zzh1snai2q9/Listening-7-Ans.pdf?rlkey=lt0m4o9luv165ve8klzfgvh2z&st=q67r95ph&raw=1",
        },
        {
            id: "listening-8",
            title: "PTE Listening 8 – Answer PDF",
            url: "https://www.dropbox.com/scl/fi/1722iibbchnsx39iobx0e/Listening-8-Ans.pdf?rlkey=r02wh1mu3kxc6g88khgiq4cqs&st=243esq08&raw=1",
        },
    ],
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