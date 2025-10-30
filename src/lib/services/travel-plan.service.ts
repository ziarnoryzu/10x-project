// src/lib/services/travel-plan.service.ts

import type { Json } from "../../db/database.types";
import type { TravelPlanOptions } from "../../types";

/**
 * Service responsible for generating travel plans from notes
 */
export class TravelPlanService {
  /**
   * Validates that the note content meets minimum requirements
   * @param content - The note content to validate
   * @returns true if valid, false otherwise
   */
  validateNoteContent(content: string | null): boolean {
    if (!content) {
      return false;
    }

    // Count words (split by whitespace and filter empty strings)
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length >= 10;
  }

  /**
   * Generates a travel plan based on note content and optional personalization options
   * @param noteContent - The content of the travel note
   * @param options - Optional personalization options
   * @returns Generated travel plan as structured JSON
   */
  async generatePlan(noteContent: string, options?: TravelPlanOptions): Promise<Json> {
    // TODO: Implement actual AI-based plan generation
    // For now, return a structured mock response that matches TravelPlanContent type

    const style = options?.style || "leisure";
    const transport = options?.transport || "public";
    const budget = options?.budget || "standard";

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const plan = {
      days: [
        {
          day: 1,
          title: "Dzień 1: Zwiedzanie centrum",
          activities: {
            morning: [
              {
                name: "Stare Miasto",
                description: `Spacer po malowniczych uliczkach Starego Miasta. ${style === "adventure" ? "Przygotuj się na intensywne zwiedzanie!" : "W spokojnym tempie poznaj lokalną architekturę."}`,
                priceCategory: budget === "economy" ? "Bezpłatne" : budget === "standard" ? "5-10 zł" : "15-20 zł (wstęp z przewodnikiem)",
                logistics: {
                  address: "Rynek Starego Miasta 1",
                  mapLink: "https://maps.google.com/?q=Rynek+Starego+Miasta",
                  estimatedTime: style === "adventure" ? "2-3 godziny" : "1-2 godziny",
                },
              },
            ],
            afternoon: [
              {
                name: "Muzeum Historyczne",
                description: `Poznaj fascynującą historię miasta przez interaktywne wystawy. ${budget === "luxury" ? "Zwiedzanie z prywatnym przewodnikiem." : "Zwiedzanie we własnym tempie."}`,
                priceCategory: budget === "economy" ? "10 zł (bilet ulgowy)" : budget === "standard" ? "20 zł" : "50 zł (tour premium)",
                logistics: {
                  address: "ul. Muzealna 15",
                  mapLink: "https://maps.google.com/?q=Muzeum+Historyczne",
                  estimatedTime: "2-3 godziny",
                },
              },
              {
                name: "Lunch w lokalnej restauracji",
                description: `Wypróbuj tradycyjne dania kuchni regionalnej. ${budget === "luxury" ? "Ekskluzywna restauracja z widokiem na miasto." : "Przytulne bistro z domową atmosferą."}`,
                priceCategory: budget === "economy" ? "20-30 zł" : budget === "standard" ? "40-60 zł" : "100-150 zł",
                logistics: {
                  address: "ul. Smaczna 7",
                  estimatedTime: "1-1.5 godziny",
                },
              },
            ],
            evening: [
              {
                name: "Spacer nad rzeką",
                description: `${style === "adventure" ? "Energiczny spacer z pięknymi widokami." : "Relaksujący wieczorny spacer o zachodzie słońca."}`,
                priceCategory: "Bezpłatne",
                logistics: {
                  address: "Bulwar Nadrzeczny",
                  estimatedTime: "1-2 godziny",
                },
              },
            ],
          },
        },
        {
          day: 2,
          title: "Dzień 2: Okolice i przyroda",
          activities: {
            morning: [
              {
                name: `${transport === "car" ? "Wycieczka samochodem" : transport === "public" ? "Przejazd autobusem" : "Wędrówka piesza"} do rezerwatu`,
                description: `Odkryj piękno lokalnej przyrody. ${style === "adventure" ? "Przygotuj się na trekking i aktywności outdoor!" : "Spokojne obcowanie z naturą."}`,
                priceCategory: transport === "car" ? "Parking: 10 zł" : transport === "public" ? "Bilet: 5 zł" : "Bezpłatne",
                logistics: {
                  address: "Rezerwat Przyrody Leśny",
                  mapLink: "https://maps.google.com/?q=Rezerwat+Przyrody",
                  estimatedTime: style === "adventure" ? "4-5 godzin" : "2-3 godziny",
                },
              },
            ],
            afternoon: [
              {
                name: "Piknik w otoczeniu natury",
                description: `Relaks na świeżym powietrzu. ${budget === "luxury" ? "Catering premium z lokalnymi specjałami." : "Własne przekąski lub lokalne produkty z pobliskiego sklepu."}`,
                priceCategory: budget === "economy" ? "15-25 zł" : budget === "standard" ? "40-60 zł" : "100-120 zł",
                logistics: {
                  estimatedTime: "1-2 godziny",
                },
              },
            ],
            evening: [
              {
                name: "Powrót do miasta",
                description: `${transport === "car" ? "Wygodny powrót własnym samochodem." : transport === "public" ? "Powrót komunikacją publiczną." : "Spacer powrotny z możliwością zatrzymania się w ciekawych miejscach."}`,
                priceCategory: transport === "car" ? "Paliwo: ~30 zł" : transport === "public" ? "Bilet: 5 zł" : "Bezpłatne",
                logistics: {
                  estimatedTime: transport === "walking" ? "2-3 godziny" : "30-60 minut",
                },
              },
            ],
          },
        },
        {
          day: 3,
          title: "Dzień 3: Kultura i rozrywka",
          activities: {
            morning: [
              {
                name: "Galeria sztuki współczesnej",
                description: `Zanurz się w świat nowoczesnej sztuki. ${budget === "luxury" ? "Prywatne oprowadzanie przez kuratora." : "Zwiedzanie z audioguidem."}`,
                priceCategory: budget === "economy" ? "Wstęp wolny w czwartki" : budget === "standard" ? "15 zł" : "40 zł + przewodnik",
                logistics: {
                  address: "pl. Artystyczny 3",
                  mapLink: "https://maps.google.com/?q=Galeria+Sztuki",
                  estimatedTime: "2-3 godziny",
                },
              },
            ],
            afternoon: [
              {
                name: "Lunch i zakupy pamiątek",
                description: `Ostatnie chwile na zakupy i delektowanie się lokalną kuchnią. ${budget === "luxury" ? "Ekskluzywne butiki i restauracje fine dining." : "Lokalne rzemiosło i przytulne kawiarnie."}`,
                priceCategory: budget === "economy" ? "30-50 zł" : budget === "standard" ? "60-100 zł" : "150-250 zł",
                logistics: {
                  address: "ul. Handlowa 12",
                  estimatedTime: "2-3 godziny",
                },
              },
            ],
            evening: [
              {
                name: style === "adventure" ? "Wieczór w klubie tanecznym" : "Spokojny wieczór w klimatycznej kawiarni",
                description: style === "adventure" ? "Zakończ podróż energicznym wieczorem pełnym tańca i zabawy!" : "Refleksja nad podróżą przy dobrej kawie i deserze.",
                priceCategory: budget === "economy" ? "20-30 zł" : budget === "standard" ? "40-60 zł" : "80-120 zł",
                logistics: {
                  address: style === "adventure" ? "ul. Klubowa 5" : "ul. Kameralna 8",
                  estimatedTime: "2-4 godziny",
                },
              },
            ],
          },
        },
      ],
      disclaimer: `Ten plan podróży został wygenerowany automatycznie na podstawie Twojej notatki i wybranych preferencji (styl: ${style}, transport: ${transport}, budżet: ${budget}). Prosimy o weryfikację godzin otwarcia i dostępności poszczególnych miejsc przed wizytą. Ceny są orientacyjne i mogą się różnić. Niektóre atrakcje mogą wymagać wcześniejszej rezerwacji.`,
    };

    // Convert to Json type via unknown to satisfy TypeScript
    return plan as unknown as Json;
  }
}

// Export a singleton instance
export const travelPlanService = new TravelPlanService();
