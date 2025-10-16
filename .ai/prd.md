# Dokument wymagań produktu (PRD) - VibeTravels

## 1. Przegląd produktu
VibeTravels to aplikacja, która ma na celu uproszczenie procesu planowania podróży. Głównym problemem, który rozwiązujemy, jest trudność w przekształcaniu luźnych pomysłów i notatek na konkretne, angażujące plany wycieczek. Wykorzystując AI, VibeTravels pozwoli użytkownikom w łatwy sposób konwertować ich zapiski na szczegółowe harmonogramy, uwzględniające ich osobiste preferencje. Celem MVP jest dostarczenie działającego produktu, który zwaliduje podstawowe założenie: użytkownicy chcą narzędzia, które automatyzuje tworzenie planów podróży na podstawie ich własnych, swobodnych notatek.

## 2. Problem użytkownika
Użytkownicy często mają wiele luźnych pomysłów i notatek dotyczących swoich podróży, ale przekształcenie ich w spójny i angażujący plan jest czasochłonne i trudne. Brakuje im narzędzia, które w inteligentny sposób pomogłoby zorganizować te pomysły, uwzględniając ich osobiste preferencje i stworzyć gotowy do realizacji harmonogram podróży.

## 3. Wymagania funkcjonalne
-   F-01: System Kont Użytkowników: Umożliwia rejestrację, logowanie, zarządzanie profilem oraz usuwanie konta.
-   F-02: Zarządzanie Notatkami o Podróżach: Użytkownicy mogą tworzyć, przeglądać, edytować, usuwać i kopiować notatki.
-   F-03: Generowanie Planu Podróży przez AI: Aplikacja generuje ustrukturyzowane plany podróży na podstawie notatek, preferencji użytkownika i dodatkowych parametrów.
-   F-04: Onboarding: Nowi użytkownicy otrzymują przykładową notatkę z gotowym planem, aby szybko zrozumieć działanie aplikacji.

## 4. Granice produktu
Następujące funkcjonalności nie wchodzą w zakres MVP:
-   Współdzielenie planów wycieczkowych między kontami.
-   Bogata obsługa i analiza multimediów (np. zdjęć).
-   Zaawansowane planowanie logistyki (np. rezerwacje, dokładne czasy, integracje z systemami rezerwacyjnymi).
-   Przechowywanie wielu wersji jednego planu dla pojedynczej notatki.
-   Manualna edycja wygenerowanych planów.
-   Monetyzacja.

## 5. Historyjki użytkowników

### Zarządzanie Kontem i Profilem

-   ID: US-001
-   Tytuł: Rejestracja nowego użytkownika
-   Opis: Jako nowy użytkownik, chcę móc założyć konto za pomocą imienia, adresu e-mail i hasła, aby móc korzystać z aplikacji.
-   Kryteria akceptacji:
    1.  Formularz rejestracji zawiera pola na imię, adres e-mail i hasło.
    2.  Po pierwszym zalogowaniu wyświetlany jest jednorazowy ekran (lub modal), który zachęca mnie do uzupełnienia preferencji turystycznych, z wyraźną opcją pominięcia tego kroku i przejściem do aplikacji.
    3.  System waliduje poprawność formatu adresu e-mail.
    4.  Po pomyślnej rejestracji jestem automatycznie zalogowany i przekierowany do głównego widoku aplikacji.
    5.  W przypadku błędu (np. zajęty e-mail) wyświetlany jest zrozumiały komunikat.
    6.  System weryfikuje, czy hasło ma co najmniej 8 znaków, zawiera co najmniej jedną małą i jedną wielką literę oraz co najmniej jedną cyfrę.

-   ID: US-002
-   Tytuł: Logowanie do aplikacji
-   Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na swoje konto, aby uzyskać dostęp do moich notatek i planów.
-   Kryteria akceptacji:
    1.  Formularz logowania zawiera pola na e-mail i hasło.
    2.  Po poprawnym wprowadzeniu danych jestem zalogowany i widzę listę moich notatek.
    3.  W przypadku błędnych danych uwierzytelniających wyświetlany jest odpowiedni komunikat.

-   ID: US-002.1
-   Tytuł: Odzyskiwanie zapomnianego hasła
-   Opis: Jako użytkownik, który zapomniał hasła, chcę mieć możliwość jego zresetowania, aby odzyskać dostęp do mojego konta.
-   Kryteria akceptacji:
    1.  Na stronie logowania znajduje się link "Nie pamiętasz hasła?".
    2.  Po kliknięciu w link i podaniu adresu e-mail, system wysyła na ten adres wiadomość z instrukcją resetu hasła.
    3.  Link do resetu hasła jest unikalny i ma ograniczony czas ważności.
    4.  Po przejściu na stronę z linku mogę ustawić nowe hasło do mojego konta.

-   ID: US-003
-   Tytuł: Wylogowanie z aplikacji
-   Opis: Jako zalogowany użytkownik, chcę móc się wylogować, aby zabezpieczyć swoje konto na współdzielonym urządzeniu.
-   Kryteria akceptacji:
    1.  W aplikacji jest stale dostępna opcja "Wyloguj".
    2.  Po kliknięciu "Wyloguj" moja sesja zostaje zakończona i jestem przekierowany na stronę logowania.

-   ID: US-004
-   Tytuł: Usuwanie konta użytkownika
-   Opis: Jako użytkownik, chcę mieć możliwość trwałego usunięcia swojego konta i wszystkich moich danych.
-   Kryteria akceptacji:
    1.  W ustawieniach profilu znajduje się opcja usunięcia konta.
    2.  Przed ostatecznym usunięciem konta wyświetlane jest okno z prośbą o potwierdzenie operacji.
    3.  Po potwierdzeniu, moje konto i wszystkie powiązane z nim dane (profil, notatki, plany) są trwale usuwane z systemu.
    4.  Po usunięciu konta jestem wylogowany.

-   ID: US-005
-   Tytuł: Zarządzanie preferencjami turystycznymi
-   Opis: Jako użytkownik, chcę móc zarządzać moimi preferencjami turystycznymi, aby AI mogło generować plany lepiej dopasowane do moich potrzeb.
-   Kryteria akceptacji:
    1.  Mam dostęp do strony profilu, gdzie mogę edytować swoje preferencje.
    2.  Preferencje są pogrupowane w kategorie: Styl podróży, Zainteresowania, Kuchnia, Tempo.
    3.  W każdej kategorii mogę wybrać wiele predefiniowanych tagów (np. dla Stylu podróży: `Relaks`, `Zwiedzanie`, `Impreza`; dla Zainteresowań: `Historia`, `Sztuka`, `Przyroda`).
    4.  Moje zmiany w preferencjach są zapisywane i uwzględniane przy kolejnym generowaniu planu podróży.
    5.  Aplikacja wyświetla widoczną, ale nieinwazyjną informację (np. baner, który można zamknąć) o korzyściach płynących z uzupełnienia profilu.

### Zarządzanie Notatkami

-   ID: US-006
-   Tytuł: Tworzenie nowej notatki o podróży
-   Opis: Jako użytkownik, chcę móc stworzyć nową notatkę, aby zapisać swoje pomysły na przyszłą podróż.
-   Kryteria akceptacji:
    1.  Z poziomu listy notatek mam przycisk do tworzenia nowej notatki.
    2.  Formularz nowej notatki zawiera opcjonalne pole na tytuł oraz pole na treść.
    3.  Jeśli nie podam tytułu, zostanie on automatycznie wygenerowany z pierwszych 5 słów treści (lub wszystkich, jeśli jest ich mniej niż 5) po zapisaniu notatki, a jego długość nie przekroczy 100 znaków.
    4.  Po zapisaniu, nowa notatka pojawia się na górze mojej listy notatek.

-   ID: US-007
-   Tytuł: Przeglądanie listy moich notatek
-   Opis: Jako użytkownik, chcę widzieć listę wszystkich moich notatek, aby mieć szybki dostęp do moich pomysłów na podróże.
-   Kryteria akceptacji:
    1.  Głównym widokiem po zalogowaniu jest lista moich notatek.
    2.  Każda pozycja na liście wyświetla tytuł notatki oraz datę ostatniej modyfikacji.
    3.  Na liście widzę wyraźne oznaczenie (np. ikona), dla których notatek został już zapisany plan podróży.

-   ID: US-008
-   Tytuł: Odczyt i edycja istniejącej notatki
-   Opis: Jako użytkownik, chcę móc otworzyć i edytować istniejącą notatkę, aby zaktualizować moje plany.
-   Kryteria akceptacji:
    1.  Kliknięcie na notatkę z listy otwiera jej widok szczegółowy.
    2.  W widoku szczegółowym mogę edytować tytuł i treść notatki.
    3.  Wprowadzone zmiany są zapisywane po kliknięciu przycisku "Zapisz".

-   ID: US-009
-   Tytuł: Usuwanie notatki
-   Opis: Jako użytkownik, chcę móc usunąć notatkę, której już nie potrzebuję.
-   Kryteria akceptacji:
    1.  Mam możliwość usunięcia notatki z poziomu jej widoku szczegółowego.
    2.  Przed usunięciem notatki system prosi o potwierdzenie.
    3.  Usunięcie notatki usuwa również powiązany z nią zapisany plan podróży.
    4.  Po usunięciu notatki jestem przekierowywany z powrotem do listy notatek.

-   ID: US-010
-   Tytuł: Kopiowanie notatki w celu stworzenia wariantu planu
-   Opis: Jako użytkownik, chcę mieć możliwość skopiowania istniejącej notatki, aby stworzyć dla niej alternatywny plan podróży (np. z innym budżetem).
-   Kryteria akceptacji:
    1.  W widoku notatki jest dostępna opcja "Kopiuj".
    2.  Użycie tej opcji tworzy nową, w pełni edytowalną notatkę z tą samą treścią co oryginał. Tytuł nowej notatki to "Kopia: [Tytuł oryginału]".
    3.  Skopiowana notatka pojawia się na liście notatek.
    4.  Nowa notatka nie ma jeszcze przypisanego planu podróży.

### Generowanie Planu Podróży

-   ID: US-011
-   Tytuł: Inicjowanie generowania planu podróży
-   Opis: Jako użytkownik, chcę móc rozpocząć proces generowania planu podróży z widoku mojej notatki.
-   Kryteria akceptacji:
    1.  W widoku szczegółowym notatki znajduje się przycisk "Wygeneruj plan podróży".
    2.  Kliknięcie przycisku otwiera formularz (modal) z opcjami personalizacji.
    3.  Jeśli dla notatki istnieje już zapisany plan, przycisk jest nadal aktywny, a jego użycie pozwoli na nadpisanie istniejącego planu.
    4.  Kliknięcie przycisku "Wygeneruj plan podróży" jest niemożliwe (przycisk jest nieaktywny), jeśli notatka zawiera mniej niż 10 słów. Po najechaniu na nieaktywny przycisk, pojawia się podpowiedź: "Dodaj więcej szczegółów do notatki, abyśmy mogli wygenerować lepszy plan".

-   ID: US-012
-   Tytuł: Generowanie planu z opcjami personalizacji
-   Opis: Jako użytkownik, chcę móc dostosować parametry generowania planu, takie jak styl, transport i budżet, aby otrzymać bardziej trafne propozycje.
-   Kryteria akceptacji:
    1.  Formularz personalizacji zawiera opcje: Styl (Wypoczynek / Przygoda), Transport (Samochód / Transport publiczny / Pieszo), Budżet (Oszczędnie / Standardowo / Luksusowo).
    2.  Opcjonalnie mogę podać własny przedział budżetowy (pola "od" i "do") w wybranej walucie z predefiniowanej listy (np. PLN, EUR, USD).
    3.  Po kliknięciu przycisku "Generuj", AI przetwarza treść notatki, moje preferencje z profilu oraz opcje z formularza.
    4.  Podczas generowania planu widzę animację ładowania (np. spinner), która informuje o trwającym procesie.
    5.  W przypadku niepowodzenia generowania planu, system wyświetla zrozumiały komunikat o błędzie (np. "Coś poszło nie tak podczas generowania planu. Spróbuj ponownie lub zmień treść notatki.") i ukrywa animację ładowania.

-   ID: US-013
-   Tytuł: Obsługa błędów i timeoutów podczas generowania planu
-   Opis: Jako użytkownik, w przypadku gdy generowanie planu podróży trwa zbyt długo lub kończy się błędem, chcę otrzymać jasny komunikat, aby wiedzieć co się stało i co mogę zrobić dalej.
-   Kryteria akceptacji:
    1.  Jeśli generowanie planu trwa dłużej niż 60 sekund, proces jest przerywany.
    2.  Po przerwaniu procesu lub wystąpieniu błędu po stronie serwera, animacja ładowania znika.
    3.  Użytkownikowi wyświetlany jest komunikat informujący o problemie i zachęcający do spróbowania ponownie za chwilę (np. "Niestety, nie udało się wygenerować planu. Spróbuj ponownie za chwilę lub zmień treść notatki, aby uzyskać lepsze rezultaty.").

-   ID: US-014
-   Tytuł: Przeglądanie wygenerowanego planu podróży
-   Opis: Jako użytkownik, chcę przejrzeć wygenerowany przez AI plan, aby zdecydować, czy go zapisać.
-   Kryteria akceptacji:
    1.  Wygenerowany plan jest prezentowany w ustrukturyzowanej formie, z podziałem na dni.
    2.  Każdy dzień zawiera listę punktów (miejsc/aktywności) z podziałem na porę dnia (Rano, Południe, Wieczór).
    3.  Każdy punkt zawiera nazwę, krótki opis, szacunkową kategorię cenową i informacje logistyczne (np. adres, link do mapy, szacowany czas zwiedzania).
    4.  Plan jest tylko do odczytu - nie mogę go manualnie edytować.
    5.  Pod planem znajduje się informacja, że został wygenerowany przez AI i może zawierać nieścisłości.

-   ID: US-015
-   Tytuł: Zapisywanie wygenerowanego planu
-   Opis: Jako użytkownik, chcę móc zapisać ("zaakceptować") wygenerowany plan, aby był on powiązany z moją notatką.
-   Kryteria akceptacji:
    1.  W widoku wygenerowanego planu znajduje się przycisk "Zapisz do moich podróży".
    2.  Po kliknięciu, plan zostaje zapisany i powiązany z bieżącą notatką.
    3.  Po zapisaniu, na liście notatek przy odpowiedniej notatce pojawia się wskaźnik informujący o zapisanym planie.
    4.  Dla jednej notatki można zapisać tylko jeden plan.

-   ID: US-016
-   Tytuł: Przeglądanie zapisanego planu podróży
-   Opis: Jako użytkownik, chcę móc w dowolnym momencie otworzyć i przejrzeć zapisany wcześniej plan podróży powiązany z moją notatką.
-   Kryteria akceptacji:
    1.  W widoku szczegółowym notatki, która ma zapisany plan, widzę ten plan.
    2.  Plan jest wyświetlany w tej samej formie, co podczas generowania (z podziałem na dni, pory dnia i punkty).
    3.  Z poziomu tego widoku mogę ponownie zainicjować generowanie planu (zgodnie z US-011).

-   ID: US-017
-   Tytuł: Nadpisywanie istniejącego planu
-   Opis: Jako użytkownik, chcę mieć możliwość ponownego wygenerowania planu dla notatki, która już ma zapisany plan, aby go zaktualizować lub zmienić.
-   Kryteria akceptacji:
    1.  Ponowne wygenerowanie i zapisanie planu dla tej samej notatki nadpisuje poprzednią wersję.
    2.  System nie przechowuje historii wersji planu.
    3.  Przed nadpisaniem istniejącego planu system prosi o potwierdzenie operacji.

### Onboarding

-   ID: US-018
-   Tytuł: Onboarding nowego użytkownika
-   Opis: Jako nowy użytkownik, chcę zobaczyć przykładową notatkę z gotowym planem, aby od razu zrozumieć, jak działa aplikacja i jaką wartość oferuje.
-   Kryteria akceptacji:
    1.  Po pierwszej rejestracji, na mojej liście notatek automatycznie pojawia się przykładowa, predefiniowana notatka.
    2.  Ta przykładowa notatka ma już wygenerowany i zapisany plan podróży.
    3.  Mogę wejść w tę notatkę i plan, aby zapoznać się z funkcjonalnością aplikacji.
    4.  Mogę usunąć przykładową notatkę, tak jak każdą inną.

-   ID: US-019
-   Tytuł: Wygląd pustej listy notatek
-   Opis: Jako użytkownik, który nie ma jeszcze żadnych notatek, chcę zobaczyć zachętę do działania, zamiast pustego ekranu.
-   Kryteria akceptacji:
    1.  Gdy moja lista notatek jest pusta, na ekranie wyświetlany jest komunikat (np. "Nie masz jeszcze żadnych notatek. Stwórz swoją pierwszą!") oraz wyraźnie widoczny przycisk do tworzenia nowej notatki.

-   ID: US-020
-   Tytuł: Zarządzanie profilem użytkownika
-   Opis: Jako użytkownik, chcę mieć możliwość zmiany danych na moim profilu, takich jak imię oraz hasło.
-   Kryteria akceptacji:
    1.  W ustawieniach profilu mogę zmienić swoje imię.
    2.  W ustawieniach profilu mogę zmienić swoje hasło, podając stare i nowe hasło.
    3.  Nowe hasło musi spełniać te same wymogi bezpieczeństwa co przy rejestracji.

## 6. Metryki sukcesu
-   Główny wskaźnik: 75% aktywnych użytkowników generuje i zapisuje 3 lub więcej unikalnych planów wycieczek w ciągu roku.
-   Wskaźnik pomocniczy: 90% aktywnych użytkowników posiada wypełnione co najmniej 3 preferencje turystyczne w swoim profilu.

