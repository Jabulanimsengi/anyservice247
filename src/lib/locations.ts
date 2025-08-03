// src/lib/locations.ts

export interface LocationData {
  [province: string]: string[];
}

export const locationsData: LocationData = {
  "Gauteng": ["Johannesburg", "Pretoria", "Sandton", "Soweto", "Midrand", "Katlehong", "Vosloorus", "Tembisa", "Boksburg", "Randburg", "Bryanston", "Centurion", "Roodepoort", "Krugersdorp", "Germiston", "Alberton", "Benoni", "Springs", "Vanderbijlpark", "Vereeniging"],
  "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "George", "Knysna", "Oudtshoorn", "Mossel Bay", "Worcester", "Hermanus", "Plettenberg Bay"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay", "Margate", "Port Shepstone", "Ballito", "Newcastle", "Ladysmith"],
  "Eastern Cape": ["Port Elizabeth", "East London", "Grahamstown", "Uitenhage", "Jeffreys Bay", "Queenstown", "Mthatha"],
  "Free State": ["Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg"],
  "Limpopo": ["Polokwane", "Mokopane", "Thohoyandou", "Giyani", "Malamulele", "Phalaborwa", "Tzaneen", "Lephalale"],
  "Mpumalanga": ["Nelspruit", "Witbank", "Middelburg", "Ermelo", "Secunda", "Hazyview"],
  "North West": ["Rustenburg", "Potchefstroom", "Klerksdorp", "Mahikeng", "Brits"],
  "Northern Cape": ["Kimberley", "Upington", "Springbok", "De Aar", "Kuruman"],
};

export const provinces = Object.keys(locationsData);