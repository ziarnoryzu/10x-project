# Prompt do kontynuacji refaktoryzacji komponentów

## 📊 Status wykonanych prac (2025-11-12)

### ✅ Usunięte pliki (łącznie ~525 LOC):
1. `src/components/Welcome.astro` (95 LOC) - nieużywany starter component
2. `src/components/travel-plan/index.ts` (6 LOC) - nieużywany barrel export
3. `src/components/note-detail/index.ts` (4 LOC) - nieużywany barrel export
4. `src/pages/profile.astro` (134 LOC) - zastąpiony przekierowaniem 301 do `/app/profile`
5. `src/components/profile/ChangePasswordForm.tsx` (164 LOC) - duplikat `PasswordChangeForm`
6. `src/components/profile/DeleteAccountButton.tsx` (91 LOC) - duplikat `DeleteAccountSection`
7. `src/components/profile/PreferencesManager.tsx` (165 LOC) - zastąpiony `TravelPreferencesForm`

### ✅ Naprawione problemy:
- Zaktualizowano wszystkie linki z `/profile` na `/app/profile` (Layout, Sidebar, MobileNav, navigation.service)
- `ProfileView` używa teraz `TravelPreferencesForm` (badge'i) zamiast `PreferencesManager`
- Uciszono fałszywe błędy 404 dla nieistniejących travel-plan (try-catch w useNoteWithPlan i useNoteDetail)

---

## 🎯 Kolejne kroki refaktoryzacji

### OPCJA A: Usunięcie redundantnego `useNoteWithPlan.ts` (~73 LOC)

**Problem:**
- Hook `useNoteWithPlan` jest używany tylko w `NoteDetailView` dla `GeneratePlanModal`
- Hook `useNoteDetail` już zwraca `note` z `travelPlan`
- Duplikacja logiki fetchingu

**Plan działania:**
1. Przeanalizuj jak `GeneratePlanModal` używa `noteWithPlan`
2. Zrefaktoruj `GeneratePlanModal` aby przyjmował `note` z `useNoteDetail`
3. Usuń `useNoteWithPlan.ts`
4. Zaktualizuj `NoteDetailView` - usuń wywołanie `useNoteWithPlan`

**Potencjalne problemy:**
- Sprawdź czy `GeneratePlanModal` nie potrzebuje specyficznego formatu danych
- Upewnij się że typy `NoteWithPlan` są kompatybilne

---

### OPCJA B: Eliminacja duplikacji TravelPlanView ↔ GeneratedPlanView (~200 LOC)

**Problem:**
- `TravelPlanView.tsx` (224 LOC) i `GeneratedPlanView.tsx` (243 LOC) mają niemal identyczny kod
- Duplikowane funkcje: `translatePriceCategory`, `formatDayHeader`, `getPriceCategoryColor`
- Duplikowane komponenty: `ActivityCard`, `TimeSection`
- Różnica: GeneratedPlanView ma przycisk "Zapisz", TravelPlanView ma header z datą utworzenia

**Plan działania:**

1. **Utwórz shared utilities:**
   ```typescript
   // src/lib/utils/travel-plan.utils.ts
   export const PRICE_CATEGORIES = {
     free: { pl: 'Bezpłatne', color: 'bg-green-100 text-green-700...' },
     budget: { pl: 'Ekonomiczne', color: 'bg-blue-100...' },
     // ...
   } as const;

   export function translatePriceCategory(category: string): string { ... }
   export function formatDayHeader(day: TravelDay): string { ... }
   export function getPriceCategoryStyles(category: string): string { ... }
   ```

2. **Wydziel shared components:**
   ```
   src/components/travel-plan/components/
   ├── ActivityCard.tsx
   ├── TimeSection.tsx
   ├── DayCard.tsx
   └── PlanDisclaimer.tsx
   ```

3. **Utwórz unified component:**
   ```typescript
   // src/components/travel-plan/TravelPlanDisplay.tsx
   interface TravelPlanDisplayProps {
     plan: TypedTravelPlan;
     variant: 'preview' | 'saved';
     onSave?: () => void;
     showGeneratedDate?: boolean;
   }
   ```

4. **Refaktoruj istniejące komponenty:**
   - `GeneratedPlanView` → wrapper nad `TravelPlanDisplay` z `variant="preview"`
   - `TravelPlanView` → wrapper nad `TravelPlanDisplay` z `variant="saved"`

**Korzyści:**
- ~200 LOC mniej do maintainowania
- Single source of truth dla renderowania planów
- Łatwiejsze dodawanie nowych feature'ów

---

### OPCJA C: Refaktoryzacja `useNoteDetail.ts` (350 LOC)

**Problem:**
- Hook robi za dużo: fetching + autosave + delete + copy + plan management
- Funkcje pomocnicze w środku hooka (formatRelativeTime, countWords)

**Plan działania:**

1. **Extract utilities:**
   ```typescript
   // src/lib/utils/note.utils.ts
   export function formatRelativeTime(dateString: string): string { ... }
   export function countWords(content: string | null): number { ... }
   export function buildNoteViewModel(note: NoteDTO, plan?: TravelPlanDTO): NoteWithPlanViewModel { ... }
   ```

2. **Split into specialized hooks:**
   ```typescript
   // src/components/hooks/useNoteFetch.ts
   export function useNoteFetch(noteId: string) {
     // tylko pobieranie notatki i planu
   }

   // src/components/hooks/useNoteAutosave.ts
   export function useNoteAutosave(noteId: string, note: NoteDTO) {
     // tylko autosave z debounce
   }

   // src/components/hooks/useNoteActions.ts
   export function useNoteActions(noteId: string) {
     // delete, copy
   }
   ```

3. **Compose in useNoteDetail:**
   ```typescript
   export function useNoteDetail(noteId: string) {
     const { note, isLoading, error, refetchPlan } = useNoteFetch(noteId);
     const { updateNote, autosaveStatus } = useNoteAutosave(noteId, note);
     const { deleteNote, copyNote, isDeleting, isCopying } = useNoteActions(noteId);
     // ...
   }
   ```

**Korzyści:**
- Lepsze SRP (Single Responsibility Principle)
- Łatwiejsze testowanie
- Możliwość reużycia poszczególnych hooków

---

### OPCJA D: Refaktoryzacja `NoteDetailView.tsx` (265 LOC)

**Problem:**
- Komponent miesza logikę UI z logiką biznesową
- Dużo stanów lokalnych (showGeneratePlanModal, isDeleteDialogOpen)

**Plan działania:**

1. **Container/Presenter Pattern:**
   ```typescript
   // NoteDetailContainer.tsx - logika
   export function NoteDetailContainer({ noteId }: Props) {
     // wszystkie hooki, handlery, stan
     return <NoteDetailPresenter {...viewModel} />;
   }

   // NoteDetailPresenter.tsx - prezentacja (czyste JSX)
   export function NoteDetailPresenter({ note, handlers, modals }: Props) {
     // tylko renderowanie, zero logiki
   }
   ```

2. **Custom hook dla modal state:**
   ```typescript
   // src/components/hooks/useModalState.ts
   export function useModalState() {
     const [modals, setModals] = useState({
       deleteDialog: false,
       generatePlan: false
     });
     
     return {
       modals,
       openModal: (name: keyof typeof modals) => ...,
       closeModal: (name: keyof typeof modals) => ...
     };
   }
   ```

3. **Feature Slicing:**
   ```
   src/components/note-detail/
   ├── index.ts
   ├── NoteDetailView.tsx (~100 LOC)
   ├── components/
   │   ├── NoteHeader.tsx
   │   ├── NoteEditor.tsx
   │   ├── NoteActions.tsx
   │   └── TravelPlanSection.tsx
   ├── hooks/
   │   ├── useNoteViewModel.ts
   │   └── useNoteActions.ts
   └── dialogs/
       ├── DeleteDialog.tsx
       └── GeneratePlanDialog.tsx
   ```

**Korzyści:**
- Lepszy Separation of Concerns
- Komponenty < 150 LOC są bardziej maintainable
- Łatwiejsze testowanie z React Testing Library

---

## 📋 Rekomendowana kolejność wykonania:

1. **NAJPIERW:** OPCJA B (największy win - eliminacja ~200 LOC duplikacji)
2. **POTEM:** OPCJA A (proste - usuń redundantny hook)
3. **NA KOŃCU:** OPCJA C lub D (bardziej czasochłonne, ale wartościowe)

---

## 🔧 Tech Stack (kontekst dla AI):

- **Frontend:** Astro 5 + React 19 + TypeScript 5
- **Styling:** Tailwind 4 + Shadcn/ui
- **Backend:** Supabase (PostgreSQL + SDK)
- **Testing:** Vitest + React Testing Library + Playwright
- **Best practices:** 
  - React functional components z hooks
  - Custom hooks dla reużywalnej logiki
  - React.memo() dla performance
  - Container/Presenter pattern dla dużych komponentów

---

## 📝 Jak użyć tego prompta:

```
Kontynuuj refaktoryzację projektu VibeTravels. 

Status: Usunięto już ~525 LOC nieużywanego kodu (szczegóły w sekcji "Status wykonanych prac").

Zadanie: [wybierz OPCJĘ A/B/C/D z sekcji "Kolejne kroki refaktoryzacji"]

Proszę:
1. Przeanalizuj wskazane pliki
2. Stwórz plan wykonania (TODO list)
3. Wykonaj refaktoryzację krok po kroku
4. Po każdej zmianie sprawdź czy aplikacja się kompiluje
5. Na końcu podsumuj zmiany i oszczędności LOC

Pamiętaj:
- Używaj React 19 best practices
- Wszystkie zmiany muszą być backward compatible
- Testy powinny dalej działać
- Kod musi być zgodny z ESLint/Prettier
```

---

## 🎯 Oczekiwane rezultaty końcowe:

Po wykonaniu wszystkich opcji A-D:
- **Usunięte:** ~400-500 dodatkowych LOC
- **Poprawiona:** maintainability, testability, reusability
- **Zachowane:** wszystkie funkcjonalności, testy, UX

---

**Data utworzenia:** 2025-11-12  
**Ostatnia aktualizacja:** 2025-11-12  
**Status:** Gotowe do użycia ✅
