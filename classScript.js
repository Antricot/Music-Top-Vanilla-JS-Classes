const artistInput = document.getElementById('artist');
const songInput = document.getElementById('songName');
const albumInput = document.getElementById('album');
const addButton = document.getElementById('add-button');
const saveButton = document.getElementById('save-button');
const musicContainer = document.getElementById('songs-list');
var selectIdForEdit = null;

class Song {
  #vote;
  #entryTopDate;

  constructor(name, artist, album, id, vote) {
    this.name = name;
    this.artist = artist;
    this.album = album;
    if (!id) {
      this.id = Date.now();
    } else {
      this.id = id;
    }

    if (!vote) {
      this.#vote = 0;
    } else {
      this.#vote = vote;
    }
    this.#entryTopDate = new Date();
  }

  vote(number) {
    this.#vote = this.#vote + number;
  }

  getVoteCount() {
    return this.#vote;
  }

  get entryTopDate() {
    return this.#entryTopDate;
  }
}

class MusicTop {
  #songs;
  constructor(songsArray) {
    this.#songs = songsArray;
  }

  addSong(song) {
    this.#songs.push(song);
  }

  getTop() {
    return this.#songs.sort(
      (a, b) =>
        b.getVoteCount() - a.getVoteCount() || b.entryTopDate - a.entryTopDate
    );
  }
}

// const musicTopTest = new MusicTop();
// const song1 = new Song('TestName', 'TestArtist', 'TestAlbum');
// musicTopTest.addSong(song1);
// const song2 = new Song('TestName2', 'TestArtist2', 'TestAlbum2');
// musicTopTest.addSong(song2);
// const song3 = new Song('TestName3', 'TestArtist3', 'TestAlbum3');
// musicTopTest.addSong(song3);

// console.log(musicTopTest);

// song3.vote(3);
// song2.vote(1);
// song1.vote(2);

// console.log(musicTopTest);

class HtmlSong extends Song {
  constructor(songData) {
    super(
      songData.name,
      songData.artist,
      songData.album,
      songData.id,
      songData.vote
    );
  }
  getHtml() {
    return `<div class="song" data-id="${this.id}">
    <p>Artist:<span id="artist-field-${this.id}">${this.artist}</span></p>
    <p>Song:<span id="song-field-${this.id}">${this.name}</span></p>
    <p>Album:<span id="album-field-${this.id}">${this.album}</span></p>
    <p>Votes:<span id="votes-field-${this.id}">${this.getVoteCount()}</span></p>
    <p>Date:<span id="date-field-${this.id}">${this.entryTopDate} </span></p>
    <button onclick="voteForSong(${this.id})">Vote</button></div>
    <button class="deleteButton" onclick="fetchDelete(${
      this.id
    })">Remove</button>
    <button class="editButton" onclick="editButton(${this.id})">Edit</button>
    `;
  }
}

// const htmlSong1 = new HtmlSong('TestName', 'TestArtist', 'TestAlbum');
// const htmlSong2 = new HtmlSong('TestName1', 'TestArtist2', 'TestAlbum2');
// const musicTop = new MusicTop();
// musicTop.addSong(htmlSong1);
// musicTop.addSong(htmlSong2);
class MusicTopHtmlGenerator {
  static getHtml(musicTop) {
    let htmlToReturn = '';
    musicTop.getTop().map((song, index) => {
      htmlToReturn += `<div>${(index += 1)}</div>${song.getHtml()}`;
    });
    return htmlToReturn;
  }
}

// const result = MusicTopHtmlGenerator.getHtml(musicTop);
// console.log(result);

const songsArray = [];
let musicTop;
console.log(musicTop);

class Client {
  async getFetchSong() {
    const response = await fetch('http://localhost:3000/songs');
    const songs = await response.json();
    songs.forEach((songData) => {
      const newSong = new HtmlSong(songData);
      songsArray.push(newSong);
    });
    console.log(songsArray);
    musicTop = new MusicTop(songsArray);
    musicTop.getTop().map((song) => {
      musicContainer.innerHTML += song.getHtml();
    });
  }
  async fetchPostSong(e) {
    e.preventDefault();

    if (
      artistInput.value.trim() === '' ||
      songInput.value.trim() === '' ||
      albumInput.value.trim() === ''
    ) {
      alert('Please fill the inputs');
      return;
    }

    const songData = {
      artist: artistInput.value,
      name: songInput.value,
      album: albumInput.value,
      date: new Date(),
    };

    const response = await fetch('http://localhost:3000/songs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(songData),
    });
    const data = await response.json();
    const newSong = new HtmlSong(data);

    musicTop.addSong(newSong);

    updateMusicTopDisplay();

    document.getElementById('song-form').reset();
  }

  async voteForSong(songId) {
    const song = songsArray.find((song) => song.id == songId);

    if (song) {
      song.vote(1);
      const response = await fetch(`http://localhost:3000/songs/${songId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote: song.getVoteCount() }),
      });
      updateMusicTopDisplay();
    }
  }
}

const client = new Client();
client.getFetchSong();
addButton.addEventListener('click', client.fetchPostSong);
function voteForSong(songId) {
  client.voteForSong(songId);
}

function updateMusicTopDisplay() {
  const html = MusicTopHtmlGenerator.getHtml(musicTop);
  document.getElementById('songs-list').innerHTML = html;
}
