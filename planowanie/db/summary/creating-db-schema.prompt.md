Jesteś architektem baz danych, którego zadaniem jest stworzenie schematu bazy danych PostgreSQL na podstawie informacji dostarczonych z sesji planowania, dokumentu wymagań produktu (PRD) i stacku technologicznym. Twoim celem jest zaprojektowanie wydajnej i skalowalnej struktury bazy danych, która spełnia wymagania projektu.

1. <prd>
@prd.md
</prd>

Jest to dokument wymagań produktu, który określa cechy, funkcjonalności i wymagania projektu.

2. <session_notes>
<conversation_summary>
<decisions>
1.  Dane profilowe użytkownika (`profiles`) zostaną oddzielone od danych uwierzytelniających (`auth.users`) w dedykowanej tabeli, połączonej relacją jeden-do-jednego.
2.  Preferencje turystyczne użytkownika będą przechowywane w kolumnie typu `JSONB` w tabeli `profiles`, co zapewnia elastyczność na etapie MVP.
3.  Treść wygenerowanego planu podróży, ze względu na swoją złożoną strukturę, również będzie przechowywana w kolumnie typu `JSONB`.
4.  Relacja jeden-do-jednego między notatką a planem podróży zostanie wymuszona przez dodanie ograniczenia `UNIQUE` na kluczu obcym `note_id` w tabeli `travel_plans`.
5.  Logika biznesowa, taka jak automatyczne generowanie tytułu notatki czy tworzenie przykładowych danych dla nowych użytkowników (onboarding), zostanie zaimplementowana w warstwie aplikacji lub poprzez funkcje serwerowe (Supabase Functions), a nie w bazie danych.
6.  Integralność danych zostanie zapewniona przez ograniczenia (`constraints`) w bazie danych, m.in. na minimalną długość pól tekstowych.
7.  Kluczowe kolumny używane w zapytaniach, zwłaszcza klucze obce (`notes.user_id`, `travel_plans.note_id`), zostaną zaindeksowane w celu zapewnienia wysokiej wydajności.
8.  Referencyjna spójność danych zostanie utrzymana za pomocą kaskadowego usuwania (`ON DELETE CASCADE`) dla wszystkich powiązanych encji (usunięcie użytkownika usuwa jego profil i wszystkie notatki, a usunięcie notatki usuwa powiązany z nią plan).
9.  Bezpieczeństwo i prywatność danych zostaną w całości oparte na mechanizmie Row Level Security (RLS) w PostgreSQL, z politykami zapewniającymi, że użytkownicy mają dostęp wyłącznie do swoich danych.
10. Dostęp do planu podróży (`travel_plans`) będzie determinowany przez własność powiązanej notatki (`notes`), co stanowi bezpieczniejszy i bardziej spójny model niż duplikowanie `user_id`.
</decisions>

<matched_recommendations>
1.  **Separacja profili od autoryzacji:** Zalecono utworzenie tabeli `profiles` połączonej z `auth.users` w relacji 1-do-1, co zostało zaakceptowane jako najlepsza praktyka w ekosystemie Supabase.
2.  **Użycie JSONB dla danych elastycznych:** Zalecono użycie typu `JSONB` do przechowywania preferencji użytkownika i treści planów podróży, co zostało zaakceptowane jako optymalne rozwiązanie dla MVP.
3.  **Integralność danych ponad denormalizacją:** Kluczowe zalecenie, aby nie dodawać redundantnej kolumny `user_id` do tabeli `travel_plans` i zamiast tego oprzeć politykę RLS na relacji z tabelą `notes`, zostało zaakceptowane jako gwarancja spójności i bezpieczeństwa danych.
4.  **Automatyzacja zarządzania danymi:** Zalecono użycie `ON DELETE CASCADE` do automatycznego czyszczenia powiązanych danych oraz triggerów do automatycznej aktualizacji pól `updated_at`, co zostało w pełni zaakceptowane.
5.  **Pełne wdrożenie RLS:** Zalecono włączenie RLS na wszystkich tabelach i zdefiniowanie ścisłych polityk bezpieczeństwa, które uniemożliwią dostęp do danych innego użytkownika, co było kluczowym wymaganiem projektu.
6.  **Indeksowanie dla wydajności:** Zalecono jawne tworzenie indeksów na kolumnach kluczy obcych, aby zapobiec problemom z wydajnością w miarę wzrostu bazy danych, co zostało zaakceptowane.
</matched_recommendations>

<database_planning_summary>
Na podstawie analizy dokumentu wymagań produktu (PRD) i dyskusji, opracowano kompletny schemat bazy danych PostgreSQL dla MVP aplikacji VibeTravels, gotowy do implementacji w Supabase.

**a. Główne wymagania dotyczące schematu bazy danych**
Schemat musi wspierać system kont użytkowników, zarządzanie notatkami podróżnymi oraz generowanie i przechowywanie unikalnego, powiązanego planu podróży dla każdej notatki. Kluczowym niefunkcjonalnym wymaganiem jest ścisła izolacja danych pomiędzy użytkownikami.

**b. Kluczowe encje i ich relacje**
-   **`profiles`**: Tabela przechowująca dane publiczne użytkownika (imię, preferencje). Połączona relacją **jeden-do-jednego** z tabelą `auth.users`.
-   **`notes`**: Główna tabela przechowująca treść notatek podróżnych. Połączona relacją **wiele-do-jednego** z tabelą `auth.users`.
-   **`travel_plans`**: Tabela przechowująca wygenerowane przez AI plany. Połączona relacją **jeden-do-jednego** z tabelą `notes`.

**c. Ważne kwestie dotyczące bezpieczeństwa i skalowalności**
-   **Bezpieczeństwo:** Fundamentem bezpieczeństwa jest mechanizm **Row Level Security (RLS)** aktywowany dla wszystkich tabel. Zdefiniowane polityki gwarantują, że użytkownik może wykonywać operacje (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) wyłącznie na wierszach, których jest właścicielem. Dostęp do planu jest dziedziczony po własności notatki, co eliminuje ryzyko niespójności.
-   **Skalowalność:** Projekt schematu jest przygotowany na wzrost. Zastosowanie indeksów na kluczach obcych zapewni wydajność złączeń. Wykorzystanie `JSONB` pozwala na łatwą ewolucję struktury przechowywanych danych bez konieczności migracji schematu. Platforma Supabase zapewnia prostą ścieżkę skalowania zasobów serwera bazodanowego.

**d. Wszelkie nierozwiązane kwestie lub obszary wymagające dalszego wyjaśnienia**
Wszystkie kwestie poruszone w trakcie dyskusji zostały rozwiązane, a rekomendacje zaakceptowane. Nie ma otwartych pytań dotyczących projektu schematu bazy danych dla MVP. Finalny, uzgodniony skrypt SQL jest gotowy do wdrożenia.
</database_planning_summary>

<unresolved_issues>
Brak nierozwiązanych kwestii. Proces planowania bazy danych dla MVP został zakończony.
</unresolved_issues>
</conversation_summary>
</session_notes>

Są to notatki z sesji planowania schematu bazy danych. Mogą one zawierać ważne decyzje, rozważania i konkretne wymagania omówione podczas spotkania.

3. <tech_stack>
@tech-stack.md
</tech_stack>

Opisuje stack technologiczny, który zostanie wykorzystany w projekcie, co może wpłynąć na decyzje dotyczące projektu bazy danych.

Wykonaj następujące kroki, aby utworzyć schemat bazy danych:

1. Dokładnie przeanalizuj notatki z sesji, identyfikując kluczowe jednostki, atrybuty i relacje omawiane podczas sesji planowania.
2. Przejrzyj PRD, aby upewnić się, że wszystkie wymagane funkcje i funkcjonalności są obsługiwane przez schemat bazy danych.
3. Przeanalizuj stack technologiczny i upewnij się, że projekt bazy danych jest zoptymalizowany pod kątem wybranych technologii.

4. Stworzenie kompleksowego schematu bazy danych, który obejmuje
   a. Tabele z odpowiednimi nazwami kolumn i typami danych
   b. Klucze podstawowe i klucze obce
   c. Indeksy poprawiające wydajność zapytań
   d. Wszelkie niezbędne ograniczenia (np. unikalność, not null)

5. Zdefiniuj relacje między tabelami, określając kardynalność (jeden-do-jednego, jeden-do-wielu, wiele-do-wielu) i wszelkie tabele łączące wymagane dla relacji wiele-do-wielu.

6. Opracowanie zasad PostgreSQL dla zabezpieczeń na poziomie wiersza (RLS), jeśli dotyczy, w oparciu o wymagania określone w notatkach z sesji lub PRD.

7. Upewnij się, że schemat jest zgodny z najlepszymi praktykami projektowania baz danych, w tym normalizacji do odpowiedniego poziomu (zwykle 3NF, chyba że denormalizacja jest uzasadniona ze względu na wydajność).

Ostateczny wynik powinien mieć następującą strukturę:
```markdown
1. Lista tabel z ich kolumnami, typami danych i ograniczeniami
2. Relacje między tabelami
3. Indeksy
4. Zasady PostgreSQL (jeśli dotyczy)
5. Wszelkie dodatkowe uwagi lub wyjaśnienia dotyczące decyzji projektowych
```

W odpowiedzi należy podać tylko ostateczny schemat bazy danych w formacie markdown, który zapiszesz w pliku .ai/db-plan.md bez uwzględniania procesu myślowego lub kroków pośrednich. Upewnij się, że schemat jest kompleksowy, dobrze zorganizowany i gotowy do wykorzystania jako podstawa do tworzenia migracji baz danych.