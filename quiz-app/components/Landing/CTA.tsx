import { AnimatedElement } from "@/app/page";
import { CoolButton } from "../RainbowButton";

export default function CTA() {
  return (
    <section className="py-32 max-w-8xl  rounded-r-[50px] mx-5 mx-auto bg-blue-600 dark:bg-blue-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20"></div>
      <div className="max-w-5xl mx-auto text-center relative">
        <AnimatedElement>
          <h2 className="text-5xl sm:text-6xl font-semibold text-white mb-8 tracking-tight">
            Ready to transform your
            <br />
            learning journey?
          </h2>
          <p className="text-base  text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners, educators, and professionals who are
            already creating smarter quizzes with our advanced AI technology
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <CoolButton
              className=" text-sm px-6 bg-zinc-950"
            />
            <p className="text-blue-100 font-medium">
              No credit card required • Free forever plan
            </p>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}
