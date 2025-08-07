    import Image from "next/image";

    import Quizzy from "../../public/quizzy.png";
    export default function Info() {
    return (
        <div className="flex flex-col container max-w-6xl mx-auto md:flex-row justify-between items-center my-20">
        <div className="">
            <h2 className="text-4xl md:text-6xl font-semibold text-zinc-900 dark:text-white mb-7 tracking-tight">
            Why choose us?
            </h2>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed max-w-md">
            Our AI-powered quiz generator is designed to help you create engaging
            quizzes that engage learners and help them learn in a fun and
            interactive way.
            </p>
        </div>
        <Image src={Quizzy} alt="info" className="rounded-md" width={400} height={400} />
        </div>
    );
    }
