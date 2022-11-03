import {
  fromEvent, 
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  Observable,
} from 'rxjs';

import { ajax } from 'rxjs/ajax';

interface City {
  nom: string,
  codesPostaux: string[],
};

type Cities = City[];

const app = () => {

  //* HTML Components
  const input = document.querySelector ("input");
  const resultsList = document.querySelector(".results-list");

  //* RxJS Observable on the input
  const tape$ = input && fromEvent(input, 'input');
  

  //* RxJS pipe
  //? transform the input event received into Cities get by the callAPI function
  const tapeResult$: Observable<Cities> | null = tape$ && tape$.pipe(
    map((event: Event) => (event.target as HTMLInputElement).value),
    distinctUntilChanged(),
    debounceTime(500),
    switchMap((value: string) => ajax('https://geo.api.gouv.fr/communes?nom=' + value)),
    map((results: any) => results.response),
  );

  //* RxJS subscribe 
  //? get the final result from the RxJS pipe 
  if (tapeResult$ && resultsList) {
    tapeResult$.subscribe((cities: Cities): void => {
      const citiesList = cities.map((city) => {
        const nom = city.nom;

        if (city.codesPostaux.length < 2) return `<li>${nom} : ${city.codesPostaux}</li>`;

        const codesPostaux = city.codesPostaux.map((code) => `<li>${code}</li>`).join('');
        return `<li>${nom} : <ul>${codesPostaux}</ul></li>`;
      })
        .join('');

      resultsList.innerHTML = `
        <h2>Résultats :</h2>
        <ul>
          ${citiesList}
        </ul>
      `;
    });
  };
}

document.addEventListener('DOMContentLoaded', app);
