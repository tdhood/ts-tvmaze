import axios from "axios";
import * as $ from "jquery";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const BASE_URL = "https://api.tvmaze.com/";

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<Array<ShowInterface>> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let showInfo = await axios.get(`${BASE_URL}search/shows?q=${term}`);
  console.log("showInfo", showInfo);
  let shows = showInfo.data.map((show: any) => {
    return {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image?.medium,
    } as ShowInterface;
  });
  console.log("shows=", shows);
  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Array<ShowInterface>) {
  $showsList.empty();
  for (let show of shows) {
    console.log("show=", show);
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<Array<EpisodeInterface>> {
  let episodeInfo = await axios.get(`${BASE_URL}/shows/${id}/episodes`);
  let episodes = episodeInfo.data.map((episode: any) => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    } as EpisodeInterface;
  });

  return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: Array<EpisodeInterface>) {
  $episodesArea.empty();
  for (let episode of episodes) {
    const $episode= $(
      `<div data-show-id="${episode.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <div class="media-body">
             <h5 class="text-primary">${episode.name}</h5>
             <div><small>Season: ${episode.season}, Number: ${episode.number}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );
    $episodesArea.append($episode);
 }
}
async function searchForEpisodes(evt: JQuery.ClickEvent): Promise<void> {
  const episodes = await getEpisodesOfShow(evt.target.closest(".Show").data("show-id")); 
  populateEpisodes(episodes);
} 
$showsList.on("click", ".Show-getEpisodes", searchForEpisodes);