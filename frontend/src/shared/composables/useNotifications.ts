/**
 * Shared Notifications Composable
 * Centralizes toast notification logic with consistent styling and behavior
 * Provides a unified interface for all notification types
 */

import { useToast } from 'vue-toastification'

export interface NotificationOptions {
  timeout?: number
  closeOnClick?: boolean
  pauseOnFocusLoss?: boolean
  pauseOnHover?: boolean
  draggable?: boolean
  showCloseButtonOnHover?: boolean
}

export function useNotifications() {
  const toast = useToast()

  // Default options for notifications
  const defaultOptions: NotificationOptions = {
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    showCloseButtonOnHover: false
  }

  /**
   * Shows a success notification
   * @param message - The success message to display
   * @param options - Optional configuration for the notification
   */
  const notifySuccess = (message: string, options?: NotificationOptions): void => {
    toast.success(message, { ...defaultOptions, ...options })
  }

  /**
   * Shows an error notification
   * @param message - The error message to display
   * @param options - Optional configuration for the notification
   */
  const notifyError = (message: string, options?: NotificationOptions): void => {
    toast.error(message, { 
      ...defaultOptions, 
      timeout: 8000, // Longer timeout for errors
      ...options 
    })
  }

  /**
   * Shows an info notification
   * @param message - The info message to display
   * @param options - Optional configuration for the notification
   */
  const notifyInfo = (message: string, options?: NotificationOptions): void => {
    toast.info(message, { ...defaultOptions, ...options })
  }

  /**
   * Shows a warning notification
   * @param message - The warning message to display
   * @param options - Optional configuration for the notification
   */
  const notifyWarning = (message: string, options?: NotificationOptions): void => {
    toast.warning(message, { 
      ...defaultOptions, 
      timeout: 7000, // Longer timeout for warnings
      ...options 
    })
  }

  /**
   * Shows a loading notification that can be updated
   * @param message - The loading message to display
   * @returns The toast ID for updating the notification
   */
  const notifyLoading = (message: string): string => {
    return toast.info(message, {
      ...defaultOptions,
      timeout: false, // Don't auto-dismiss loading notifications
      closeOnClick: false,
      draggable: false
    }) as string
  }

  /**
   * Updates an existing notification
   * @param toastId - The ID of the toast to update
   * @param message - The new message
   * @param type - The new notification type
   */
  const updateNotification = (
    toastId: string, 
    message: string
  ): void => {
    toast.update(toastId, {
      content: message,
      options: {
        ...defaultOptions
      }
    })
  }

  /**
   * Dismisses a specific notification
   * @param toastId - The ID of the toast to dismiss
   */
  const dismissNotification = (toastId: string): void => {
    toast.dismiss(toastId)
  }

  /**
   * Dismisses all notifications
   */
  const dismissAll = (): void => {
    toast.clear()
  }

  /**
   * Shows a confirmation-style notification with custom styling
   * @param message - The confirmation message
   * @param options - Optional configuration
   */
  const notifyConfirmation = (message: string, options?: NotificationOptions): void => {
    toast.success(message, {
      ...defaultOptions,
      timeout: 3000, // Shorter timeout for confirmations
      ...options
    })
  }

  /**
   * Shows a network error notification with retry suggestion
   * @param action - The action that failed (optional)
   */
  const notifyNetworkError = (action?: string): void => {
    const message = action 
      ? `No se pudo ${action}. Verifica tu conexión a internet e intenta nuevamente.`
      : 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.'
    
    notifyError(message, { timeout: 10000 })
  }

  /**
   * Shows a validation error notification
   * @param errors - Array of validation error messages or single message
   */
  const notifyValidationError = (errors: string | string[]): void => {
    const message = Array.isArray(errors) 
      ? `Errores de validación: ${errors.join(', ')}`
      : `Error de validación: ${errors}`
    
    notifyError(message)
  }

  /**
   * Shows an authentication error notification
   */
  const notifyAuthError = (): void => {
    notifyError('Sesión expirada. Por favor, inicia sesión nuevamente.', {
      timeout: 8000
    })
  }

  /**
   * Show confirmation dialog
   */
  const showConfirm = async (
    title: string,
    message: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.confirm(`${title}\n\n${message}`)) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  return {
    // Basic notifications
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    
    // Advanced notifications
    notifyLoading,
    updateNotification,
    notifyConfirmation,
    
    // Specialized notifications
    notifyNetworkError,
    notifyValidationError,
    notifyAuthError,
    
    // Confirmation methods
    showConfirm,
    
    // Control methods
    dismissNotification,
    dismissAll
  }
}

// Export type for external use
export type UseNotifications = ReturnType<typeof useNotifications>