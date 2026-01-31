import { Toaster, toast } from 'sonner';

// Re-export toast for easy imports
export { toast };

// Toast container component - add to app root
export const ToastProvider: React.FC = () => {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                },
                className: 'sonner-toast',
            }}
            theme="dark"
        />
    );
};

// Helper functions for common toast types
export const showSuccess = (message: string) => {
    toast.success(message);
};

export const showError = (message: string) => {
    toast.error(message);
};

export const showLoading = (message: string) => {
    return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
    toast.dismiss(toastId);
};

export const showPromise = <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
) => {
    return toast.promise(promise, messages);
};

export default ToastProvider;
