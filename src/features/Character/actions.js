// @flow

import axios from 'axios';
import config from 'config';
import { browserHistory } from 'react-router';
import get from 'lodash/get';
import forEach from 'lodash/forEach';

import actions from 'features/Gw2/actions';

export const FETCH_CHARACTER_RESULT = 'FETCH_CHARACTER_RESULT';
export const FETCHING_CHARACTER = 'FETCHING_CHARACTER';
export const SELECT_CHARACTER = 'SELECT_CHARACTER';
export const SELECT_CHARACTER_MODE = 'SELECT_CHARACTER_MODE';
export const UPDATE_CHARACTER = 'UPDATE_CHARACTER';

const fetchingCharacter = (fetching) => ({
  type: FETCHING_CHARACTER,
  payload: fetching,
});

const fetchCharacterResultSuccess = (name, data) => ({
  type: FETCH_CHARACTER_RESULT,
  payload: {
    name,
    data,
  },
});

function extractIds ({ specializations, equipment, equipment_pvp, skills }) {
  const ids = {
    items: [],
    skins: [],
    specializations: [],
    amulets: [],
    pets: [],
  };

  specializations && Object.keys(specializations).forEach((key) => {
    const mode = specializations[key];
    mode.forEach((specialization) => {
      if (!specialization) {
        return;
      }

      ids.specializations.push(specialization.id);
    });
  });

  equipment && equipment.forEach((item) => {
    ids.skins.push(item.skin);
    ids.items.push(item.id);

    if (item.upgrades) {
      ids.items = ids.items.concat(item.upgrades);
    }

    if (item.infusions) {
      ids.items = ids.items.concat(item.infusions);
    }
  });

  if (equipment_pvp) {
    ids.items = ids.items.concat(equipment_pvp.sigils);
    ids.items.push(equipment_pvp.rune);
    ids.amulets.push(equipment_pvp.amulet);
  }

  forEach(skills, ({ pets }) => {
    pets && (ids.pets = ids.pets.concat(pets.terrestrial));
  });

  return ids;
}

export function fetchCharacter (character: string, { redirect404 = true, ignoreAuth, basicLoad }: {
  redirect404: boolean,
  ignoreAuth: boolean,
  basicLoad: boolean,
} = {}): ReduxThunk {
  return (dispatch) => {
    dispatch(fetchingCharacter(true));

    return axios.get(`${config.api.endpoint}characters/${character}`, { ignoreAuth })
      .then(({ data }) => {
        dispatch(fetchCharacterResultSuccess(character, data));
        dispatch(fetchingCharacter(false));

        const { items, skins, specializations, amulets, pets } = extractIds(data);

        const skills = Object.keys(get(data, 'skills', {})).reduce((acc, key) => {
          const skillType = data.skills[key];
          return acc.concat([skillType.elite, skillType.heal]).concat(skillType.utilities);
        }, []);

        dispatch(actions.fetchItems(items));
        dispatch(actions.fetchSkins(skins));
        dispatch(actions.fetchProfessions([data.profession]));

        if (!basicLoad) {
          dispatch(actions.fetchTitles([data.title]));
          dispatch(actions.fetchPets(pets));
          dispatch(actions.fetchSkills(skills));
          dispatch(actions.fetchAmulets(amulets));
          dispatch(actions.fetchSpecializations(specializations));
        }
      }, () => redirect404 && browserHistory.replace('/404'));
  };
}

function updateCharacterAuth (name, authorization) {
  return {
    type: UPDATE_CHARACTER,
    payload: {
      name,
      authorization,
    },
  };
}

export function updateCharacter (
  name: string,
  { showPublic }: { showPublic: boolean },
): ReduxThunk {
  return (dispatch) => {
    dispatch(updateCharacterAuth(name, { showPublic }));
    return axios.put(`${config.api.endpoint}characters/${name}`, { showPublic });
  };
}

export const selectCharacter = (name: string) => ({
  type: SELECT_CHARACTER,
  payload: name,
});

export const selectCharacterMode = (mode: 'pvp' | 'pve' | 'wvw') => ({
  type: SELECT_CHARACTER_MODE,
  payload: mode,
});
