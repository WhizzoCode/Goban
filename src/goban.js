class GobanBoard extends HTMLElement {

  isConnected = false;
  size = 19;
  positions = [];
  config = {
    board_border_width: 0.75,
    board_color: '#e3b85e',
    // board_color: '#fff',
    board_grid_width: 0.05,
    board_star_radius: 0.1,
    board_marks_color: '#000',
    stone_radius: 0.5,
    stone_border_width: 0.05,
    stone_black_border_color: '#000',
    stone_black_color: '#000',
    stone_white_border_color: '#000',
    stone_white_color: '#fff'
  };

  constructor() {
    super();
  }

  connectedCallback() {
    this.isConnected = true;
    this.drawBoard();
  }

  disconnectedCallback() {
    this.isConnected = false;
  }

  static get observedAttributes() {
    return ['size', 'positions'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'size':
        this.size = Number(newValue) || 19;
        break;
      case 'positions':
        this.positions = [];
        if (newValue) {
          const positionsRaw = newValue.trim().split(/\s+/);
          positionsRaw.forEach((positionRaw) => {
            const position = this.parsePosition(positionRaw);
            if (position) {
              const duplicatePosition = this.positions.filter(currentPosition => {
                if (
                  currentPosition.x === position.x &&
                  currentPosition.y === position.y
                ) return true;
                return false;
              })[0];
              if (duplicatePosition) {
                const duplicatePositionIndex = this.positions.indexOf(duplicatePosition);
                this.positions.splice(duplicatePositionIndex, 1);
              }
              this.positions.push(position);
            }
          });
        }
        break;
    }
    if (this.isConnected) this.drawBoard();
  }

  drawBoard() {
    const board_start = 1 - this.config.board_border_width;
    const board_width = 2 * this.config.board_border_width + this.size - 1;
    const grid_start = 1 - (this.config.board_grid_width / 2);
    const grid_end = this.size + (this.config.board_grid_width / 2);
    this.config.stone_radius -= this.config.stone_border_width / 2;

    let board = `
      <style>
        goban-board {display: inline-block;}
      </style>
      <svg xmlns="http://www.w3.org/2000/svg" viewbox="${board_start} ${board_start} ${board_width} ${board_width}">
        <rect x="${board_start}" y="${board_start}" width="${board_width}" height="${board_width}" fill="${this.config.board_color}"></rect>
        <path stroke-width="${this.config.board_grid_width}" stroke="${this.config.board_marks_color}" d="
    `;
    for (let i = 1; i <= this.size; i++) {
      board += `
        M ${grid_start} ${i} H ${grid_end}
        M ${i} ${grid_start} V ${grid_end}
      `;
    }
    board += `
        "></path>
    `;
    let stars = [];
    if (this.size === 9) {
      stars = [[3, 3], [7, 3], [5, 5], [3, 7], [7, 7]];
    } else if (this.size === 13) {
      stars = [[4, 4], [10, 4], [7, 7], [4, 10], [10, 10]];
    } else if (this.size === 19) {
      stars = [[4, 4], [10, 4], [16, 4], [4, 10], [10, 10], [16, 10], [4, 16], [10, 16], [16, 16]];
    }
    stars.forEach(point => {
      board += `
        <circle cx="${point[0]}" cy="${point[1]}" r="${this.config.board_star_radius}" fill="${this.config.board_marks_color}"></circle>
      `;
    });
    this.positions.filter(position => {
      if (position.player === null) return null;
      if (position.x > this.size) return null;
      if (position.y > this.size) return null;
      return true;
    }).forEach(position => {
      let stoneColor = this.config.stone_black_color;
      let stoneBorderColor = this.config.stone_black_border_color;
      if (position.player === 'W') {
        stoneColor = this.config.stone_white_color;
        stoneBorderColor = this.config.stone_white_border_color;
      }
      board += `
        <circle cx="${position.x}" cy="${position.y}" r="${this.config.stone_radius}" fill="${stoneColor}" stroke="${stoneBorderColor}" stroke-width="${this.config.stone_border_width}"></circle>  
      `;
    });
    board += `
      </svg>
    `;

    this.innerHTML = board;
  }

  parsePosition(positionRaw) {
    const regexp = /^([BW]?)(\d+)-(\d+)(\[(.+)\])?$/i;
    const positionMatch = positionRaw.match(regexp);

    if (
      !positionMatch ||
      !(positionMatch[2] && positionMatch[3]) ||
      !(positionMatch[1] || positionMatch[5])
    ) return null;

    return {
      player: positionMatch[1] ? positionMatch[1].toUpperCase() : null,
      x:      Number(positionMatch[2]),
      y:      Number(positionMatch[3]),
      mark:   positionMatch[5] ? positionMatch[5] : null
    };
  }
  
}

customElements.define('goban-board', GobanBoard);
