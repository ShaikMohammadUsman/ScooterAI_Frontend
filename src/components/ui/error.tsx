// components/ErrorPage.tsx
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { Button } from './button';
import { AlertCircle } from 'lucide-react';

interface ErrorPageProps {
    message?: string;
    action?: () => void;
}

const ErrorBox: FC<ErrorPageProps> = ({ message, action }) => {
    const router = useRouter();

    return (
        <div
            className="min-h-[50vh] w-full flex items-center justify-center p-6 animate-fade-in"
            role="alert"
            aria-live="assertive"
        >
            <div className="max-w-md w-full">
                <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl">
                    {/* Error Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 mb-6 animate-scale-in">
                        <AlertCircle className="h-8 w-8 text-rose-500 dark:text-rose-400" />
                    </div>

                    {/* Error Content */}
                    <div className="space-y-4 text-center">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {message}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                className="w-full group transition-all duration-300 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
                                <span className="ml-2">Go Back</span>
                            </Button>
                            <Button
                                onClick={() => router.push('/')}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white transition-colors duration-300"
                            >
                                Return Home
                            </Button>
                        </div>

                        {action && (
                            <Button
                                onClick={action}
                                variant="secondary"
                                className="w-full group hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300"
                            >
                                <span className="group-hover:rotate-180 transition-transform duration-500 inline-block mr-2">↻</span>
                                Retry
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
        // <div
        //     className="h-full w-full flex items-center justify-center  p-4"
        //     role="alert"
        //     aria-live="assertive"
        // >
        //     <div className="flex justify-center items-center text-center max-w-2xl w-full">
        //         <div className="bg-white p-8 rounded-lg shadow-lg border border-red-100">
        //             {/* Error Icon */}
        //             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-6">
        //                 <svg
        //                     className="h-6 w-6 text-red-600"
        //                     fill="none"
        //                     viewBox="0 0 24 24"
        //                     stroke="currentColor"
        //                     aria-hidden="true"
        //                 >
        //                     <path
        //                         strokeLinecap="round"
        //                         strokeLinejoin="round"
        //                         strokeWidth={2}
        //                         d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        //                     />
        //                 </svg>
        //             </div>

        //             {/* Error Message */}
        //             <h1 className="text-3xl font-bold text-gray-900 mb-4">
        //                 Oops! Something went wrong
        //             </h1>
        //             <p className="text-gray-600 mb-8 text-lg">
        //                 {message}
        //             </p>

        //             {/* Action Buttons */}
        //             <div className="grid grid-cols-2 justify-center gap-4">
        //                 <Button
        //                     onClick={() => router.back()}
        //                     className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        //                 >
        //                     Go Back
        //                 </Button>
        //                 <Button
        //                     onClick={() => router.push('/activities')}
        //                     className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        //                 >
        //                     Return Home
        //                 </Button>
        //             </div>
        //             {
        //                 action && (
        //                     <Button
        //                         variant="success"
        //                         onClick={action}
        //                         className='w-full mt-4'
        //                     >
        //                         Retry
        //                     </Button>
        //                 )
        //             }
        //         </div>
        //     </div>
        // </div>
    );
};

export default ErrorBox;