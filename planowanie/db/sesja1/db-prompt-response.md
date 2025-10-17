<pytania>
1. Czy dane uwierzytelniające użytkownika (z `auth.users` w Supabase) powinny być oddzielone od danych profilowych, takich jak imię i preferencje turystyczne, poprzez stworzenie dedykowanej tabeli `profiles`?

   Rekomendacja: Tak, należy utworzyć tabelę `profiles` połączoną relacją jeden-do-jednego z tabelą `auth.users` za pomocą UUID użytkownika. Tabela ta będzie przechowywać dane niewrażliwe i preferencje, co jest zgodne z najlepszymi praktykami Supabase i upraszcza polityki RLS.

2. W jaki sposób powinny być przechowywane preferencje turystyczne użytkownika (np. Styl podróży, Zainteresowania)? Czy jako kolumna `JSONB` w tabeli `profiles`, czy też przy użyciu oddzielnych, znormalizowanych tabel dla kategorii, tagów i powiązań z użytkownikiem?

   Rekomendacja: Dla MVP, przechowywanie preferencji w kolumnie typu `JSONB` w tabeli `profiles` jest prostsze i szybsze w implementacji. Podejście to unika skomplikowanych złączeń, chociaż oferuje mniejszą elastyczność zapytań. W przyszłości można przeprowadzić migrację do struktury znormalizowanej.

3. Jak najlepiej wymusić relację jeden-do-jednego między notatką (`notes`) a planem podróży (`travel_plans`), zgodnie z wymaganiem, że jedna notatka może mieć tylko jeden zapisany plan?

   Rekomendacja: Należy dodać klucz obcy `note_id` w tabeli `travel_plans` i nałożyć na niego ograniczenie `UNIQUE`. Zapewni to, że każda notatka może być powiązana z co najwyżej jednym planem podróży, egzekwując regułę biznesową na poziomie bazy danych.

4. Biorąc pod uwagę, że wygenerowany plan podróży ma złożoną, zagnieżdżoną strukturę (dni, pory dnia, aktywności), czy jego treść powinna być przechowywana w kolumnie typu `JSONB`?

   Rekomendacja: Tak, należy użyć typu danych `JSONB` dla treści planu. Pozwoli to na efektywne przechowywanie złożonych, ustrukturyzowanych danych, jednocześnie umożliwiając w przyszłości zaawansowane zapytania i indeksowanie zagnieżdżonych pól wewnątrz planu.

5. Jaka jest fundamentalna polityka bezpieczeństwa na poziomie wiersza (RLS) wymagana dla tabeli `notes`, aby użytkownicy mieli dostęp wyłącznie do swoich danych?

   Rekomendacja: Podstawowa polityka RLS dla tabeli `notes` powinna zapewniać, że użytkownik może wykonywać operacje `SELECT`, `INSERT`, `UPDATE` i `DELETE` tylko na tych wierszach, w których kolumna `user_id` jest zgodna z jego własnym, uwierzytelnionym identyfikatorem (`auth.uid()`).

6. W jaki sposób powinny być skonstruowane polityki RLS dla tabeli `travel_plans`, aby zapewnić prywatność danych, biorąc pod uwagę, że plany są powiązane z notatkami?

   Rekomendacja: Dostęp do `travel_plan` powinien być przyznany, jeśli żądający użytkownik jest właścicielem powiązanej notatki. Polityka RLS powinna wykonać podzapytanie lub złączenie, aby sprawdzić, czy `notes.user_id` dla odpowiedniego `travel_plans.note_id` odpowiada identyfikatorowi bieżącego użytkownika (`auth.uid()`).

7. Jak powinna być zaimplementowana logika automatycznego generowania tytułu notatki (`note`), jeśli użytkownik go nie poda?

   Rekomendacja: Tę logikę najlepiej zaimplementować w warstwie aplikacji, przed wykonaniem operacji `INSERT`. Alternatywnie, można utworzyć funkcję wyzwalacza (trigger) w PostgreSQL, która przy operacji `INSERT` sprawdzałaby, czy tytuł jest `NULL` i uzupełniała go kilkoma pierwszymi słowami z treści. Dla MVP podejście w warstwie aplikacji jest prostsze.

8. Czy powinniśmy zdefiniować jawne ograniczenia (constraints), takie jak maksymalna długość dla tytułu i treści notatki, aby zapewnić integralność danych?

   Rekomendacja: Tak, należy zdefiniować rozsądne ograniczenia `CHECK` (np. `length(title) < 255`, `content IS NOT NULL AND content != ''`). Zapobiegnie to wprowadzaniu nieprawidłowych danych do bazy i zapewni jasne granice dla aplikacji oraz API.

9. Jaki jest najbardziej krytyczny indeks, który należy utworzyć, aby zapewnić dobrą wydajność głównego ekranu aplikacji, czyli listy notatek danego użytkownika?

   Rekomendacja: Należy utworzyć indeks na kolumnie `user_id` w tabeli `notes`. Znacząco przyspieszy to zapytania pobierające wszystkie notatki należące do konkretnego, zalogowanego użytkownika, co jest podstawową operacją w aplikacji.

10. Jak z perspektywy bazy danych należy obsłużyć tworzenie przykładowej notatki i planu dla nowych użytkowników w ramach onboardingu?

    Rekomendacja: Należy to zaimplementować jako funkcję po stronie serwera (np. Supabase Edge Function), która jest wywoływana po zarejestrowaniu nowego użytkownika. Funkcja ta wstawiałaby (`INSERT`) predefiniowaną przykładową notatkę oraz jej plan, przypisując nowemu użytkownikowi `user_id`. Pozwala to oddzielić logikę onboardingu od głównego schematu bazy danych.
</pytania>