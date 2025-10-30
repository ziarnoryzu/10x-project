import { useEffect } from "react";
import { toast } from "sonner";
import { useProfile } from "../hooks/useProfile";
import { Skeleton } from "../ui/skeleton";
import { ProfileForm } from "../profile/ProfileForm";
import { PasswordChangeForm } from "../profile/PasswordChangeForm";
import { PreferencesManager } from "../profile/PreferencesManager";
import { DeleteAccountSection } from "../profile/DeleteAccountSection";
import type { UpdateUserProfileDTO, ChangePasswordDTO } from "@/types";

/**
 * ProfileView - Main component for user profile management
 * Manages all profile sections: personal data, security, preferences, and account deletion
 */
export function ProfileView() {
  const { profile, isLoading, isSaving, error, updateProfile, changePassword, deleteAccount } = useProfile();

  // Show toast notification when there's an error
  useEffect(() => {
    if (error && !isLoading) {
      toast.error(error);
    }
  }, [error, isLoading]);

  // Loading state - show skeletons
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border p-6">
              <Skeleton className="mb-4 h-6 w-32" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state - profile not loaded
  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
          <h2 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-100">Błąd ładowania profilu</h2>
          <p className="text-sm text-red-800 dark:text-red-200">
            Nie udało się załadować profilu. Spróbuj odświeżyć stronę.
          </p>
        </div>
      </div>
    );
  }

  // Handler for updating name
  const handleUpdateName = async (name: string) => {
    const data: UpdateUserProfileDTO = { name };
    await updateProfile(data);
    toast.success("Imię zaktualizowane");
  };

  // Handler for updating preferences
  const handleUpdatePreferences = async (preferences: string[]) => {
    const data: UpdateUserProfileDTO = { preferences };
    await updateProfile(data);
    toast.success("Preferencje zapisane");
  };

  // Handler for changing password
  const handleChangePassword = async (data: ChangePasswordDTO) => {
    await changePassword(data);
    toast.success("Hasło zostało zmienione");
  };

  // Handler for deleting account
  const handleDeleteAccount = async () => {
    await deleteAccount();
    // Redirect is handled in the hook
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Profil użytkownika</h1>
        <p className="text-muted-foreground">Zarządzaj swoimi danymi osobowymi, bezpieczeństwem i preferencjami</p>
      </div>

      {/* Main content - sections */}
      <div className="space-y-6">
        {/* Section 1: Personal Data */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Dane osobowe</h2>
            <p className="text-sm text-muted-foreground">Zaktualizuj swoje podstawowe informacje</p>
          </div>
          <ProfileForm initialName={profile.name} onUpdate={handleUpdateName} isSaving={isSaving} />
        </section>

        {/* Section 2: Security */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Bezpieczeństwo</h2>
            <p className="text-sm text-muted-foreground">Zmień swoje hasło aby zabezpieczyć konto</p>
          </div>
          <PasswordChangeForm onPasswordChange={handleChangePassword} isSaving={isSaving} />
        </section>

        {/* Section 3: Travel Preferences */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Preferencje turystyczne</h2>
            <p className="text-sm text-muted-foreground">
              Dodaj swoje preferencje podróży, aby uzyskać bardziej spersonalizowane plany
            </p>
          </div>
          <PreferencesManager
            initialPreferences={profile.preferences}
            onUpdate={handleUpdatePreferences}
            isSaving={isSaving}
          />
        </section>

        {/* Section 4: Account Management */}
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Zarządzanie kontem</h2>
            <p className="text-sm text-muted-foreground">Usuń swoje konto i wszystkie powiązane dane</p>
          </div>
          <DeleteAccountSection userEmail={profile.email} onDelete={handleDeleteAccount} isSaving={isSaving} />
        </section>
      </div>
    </div>
  );
}
