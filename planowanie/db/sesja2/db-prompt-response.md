<pytania>
Dziękuję za odpowiedzi. To świetne pytanie dotyczące denormalizacji i dodania `user_id` do tabeli `travel_plans` w celu uproszczenia RLS. Rozważmy to.

Twoje podejście ma jedną, kluczową zaletę:
*   **Prostsza i potencjalnie szybsza polityka RLS:** Polityka bezpieczeństwa dla `travel_plans` stałaby się trywialna (`auth.uid() = user_id`), eliminując potrzebę złączenia z tabelą `notes` podczas sprawdzania uprawnień.

Jednakże, wprowadza ono istotne wady:
*   **Ryzyko niespójności danych:** To największy problem. Pojawia się możliwość, że `user_id` w tabeli `travel_plans` będzie inny niż `user_id` właściciela powiązanej notatki. Taka sytuacja mogłaby prowadzić do błędów logicznych, a nawet luk w bezpieczeństwie, gdzie użytkownik mógłby stracić dostęp do swojego planu lub, w skrajnym przypadku, inny użytkownik mógłby go zobaczyć.
*   **Zwiększona złożoność zapisu:** Aby utrzymać spójność, przy każdej operacji zapisu lub aktualizacji planu, aplikacja musiałaby dodatkowo zapewnić, że `travel_plans.user_id` jest poprawnie skopiowany z nadrzędnej notatki. To przenosi złożoność z RLS do logiki biznesowej aplikacji.
*   **Nadmiarowość danych (Denormalizacja):** Przechowujemy tę samą informację (`user_id`) w dwóch miejscach, co jest sprzeczne z zasadami normalizacji baz danych.

**Rekomendacja:** Trzymajmy się pierwotnego planu. Użycie podzapytania lub złączenia w polityce RLS jest standardową i bezpieczną praktyką w PostgreSQL. Gwarantuje ono, że źródłem prawdy o własności jest zawsze notatka (`note`), co eliminuje ryzyko niespójności. Dla skali MVP, ewentualny, minimalny narzut wydajnościowy takiego złączenia będzie niezauważalny, a zysk w postaci integralności i bezpieczeństwa danych jest ogromny.

---

Biorąc pod uwagę Twoje dotychczasowe decyzje, przejdźmy do bardziej szczegółowych kwestii. Oto kolejna lista pytań i zaleceń:

1.  Ustaliliśmy, że powstanie tabela `profiles`. Jakie dokładnie kolumny, oprócz `id` (klucz obcy do `auth.users`) i `preferences` (JSONB), powinna zawierać dla MVP, aby spełnić wymagania `US-001` i `US-005`?

    Rekomendacja: Tabela `profiles` powinna zawierać co najmniej kolumny: `id` (UUID, PK, FK do `auth.users`), `full_name` (TEXT, NOT NULL), `preferences` (JSONB), `created_at` (TIMESTAMPTZ) oraz `updated_at` (TIMESTAMPTZ).

2.  Jakie działanie powinno zostać podjęte na poziomie bazy danych w momencie usunięcia konta użytkownika z tabeli `auth.users` w Supabase?

    Rekomendacja: Należy ustawić kaskadowe usuwanie (`ON DELETE CASCADE`) dla klucza obcego w tabeli `profiles`, który odnosi się do `auth.users`. Sprawi to, że usunięcie użytkownika automatycznie usunie jego profil, co jest kluczowe dla `US-004`.

3.  Jak powinna wyglądać relacja między tabelami `notes` i `travel_plans` w kontekście usuwania danych? Co się stanie z planem, jeśli notatka zostanie usunięta?

    Rekomendacja: Klucz obcy `note_id` w tabeli `travel_plans` powinien również używać `ON DELETE CASCADE`. Zapewni to, że usunięcie notatki automatycznie usunie powiązany z nią plan podróży, zgodnie z kryterium akceptacji `US-009`.

4.  Wymagania (`US-012`) definiują predefiniowane opcje personalizacji planu, takie jak Styl, Transport i Budżet. Czy te opcje powinny być zwalidowane na poziomie bazy danych?

    Rekomendacja: Na etapie MVP walidację tych opcji można przeprowadzić w warstwie aplikacji. Jednak, aby zwiększyć spójność danych, można rozważyć użycie w PostgreSQL typów `ENUM` dla każdej z tych kategorii, co zapewni, że do bazy trafią tylko dozwolone wartości.

5.  Czy kolumny przechowujące datę utworzenia i modyfikacji (np. `created_at`, `updated_at`) powinny automatycznie ustawiać swoje wartości?

    Rekomendacja: Tak, należy ustawić dla kolumn `created_at` wartość domyślną `now()` lub `CURRENT_TIMESTAMP`. Dla `updated_at` warto stworzyć prostą funkcję i wyzwalacz (trigger), który będzie automatycznie aktualizował tę kolumnę przy każdej zmianie wiersza (`UPDATE`). Supabase oferuje gotowe fragmenty kodu do tego celu.

6.  Jaka powinna być polityka RLS dla tabeli `profiles`? Czy użytkownicy powinni mieć możliwość przeglądania profili innych użytkowników?

    Rekomendacja: Zgodnie z domyślnymi wymaganiami prywatności, polityka RLS dla `profiles` powinna zezwalać na odczyt (`SELECT`) i modyfikację (`UPDATE`) tylko wtedy, gdy `id` profilu jest zgodne z `auth.uid()` zalogowanego użytkownika. Należy również umożliwić `INSERT` dla nowo tworzonych profili.

7.  Czy w tabeli `notes` powinniśmy jawnie przechowywać informację o tym, czy do notatki jest przypisany plan podróży, aby ułatwić implementację `US-007` (oznaczenie na liście)?

    Rekomendacja: Nie jest to konieczne. Tę informację można wydajnie uzyskać w locie za pomocą zapytania `LEFT JOIN` do tabeli `travel_plans` i sprawdzenia, czy powiązany plan istnieje (`IS NOT NULL`). Unikniemy w ten sposób redundancji danych.

8.  W jaki sposób zdefiniować ograniczenia (constraints) dla zawartości `JSONB` w kolumnie `preferences` w tabeli `profiles`, aby upewnić się, że struktura danych jest zawsze poprawna (np. zawiera klucze "styl", "zainteresowania")?

    Rekomendacja: Można dodać ograniczenie `CHECK` na tabeli `profiles`, które będzie walidować strukturę JSONB, sprawdzając obecność wymaganych kluczy najwyższego poziomu za pomocą operatora `?`. Na przykład: `CHECK (preferences ? 'style' AND preferences ? 'interests')`.

9.  Czy dla kluczy obcych (`notes.user_id`, `travel_plans.note_id`) powinniśmy tworzyć indeksy ręcznie?

    Rekomendacja: PostgreSQL automatycznie tworzy indeksy dla kluczy głównych i ograniczeń `UNIQUE`. Jednak dla kluczy obcych nie tworzy ich domyślnie. Należy jawnie utworzyć indeksy na wszystkich kolumnach kluczy obcych, aby zapewnić wysoką wydajność operacji złączeń (JOIN), co jest kluczowe dla zapytań RLS.

10. Czy na obecnym etapie MVP potrzebujemy RLS dla Supabase Storage (`storage.objects`)?

    Rekomendacja: Zgodnie z granicami produktu (`F-04` w PRD), które wykluczają bogatą obsługę multimediów, na tym etapie nie ma potrzeby definiowania polityk RLS dla Storage. Możemy to pominąć i wrócić do tematu w przyszłości.
</pytania>