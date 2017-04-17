/**
 * Interface for interacting with the Meta Bar
 */
export default class MetaBar {

  constructor(metaBarElement) {
    this.metaBar = metaBarElement;
    this.data = {
      users: 1,
      selfPlaced: 0,
      othersPlaced: 0,
    };

    this.initializeValues();
  }

  initializeValues() {
    this.setText("mb-users-val", this.data.users);
    this.setText("mb-placed-val", this.data.selfPlaced);
    this.setText("mb-others-val", this.data.othersPlaced);
  }

  setUserCount(num) {
    this.data.users = num;
    this.setText("mb-users-val", num);
  }

  incrementUsers() {
    this.data.users++;
    this.setText("mb-users-val", this.data.users);
  }

  decrementUsers() {
    this.data.users--;
    this.setText("mb-users-val", this.data.users);
  }

  incrementSelfPlaced() {
    this.data.selfPlaced++;
    this.setText("mb-placed-val", this.data.selfPlaced);
  }

  incrementOthersPlaced() {
    this.data.othersPlaced++;
    this.setText("mb-others-val", this.data.othersPlaced);
  }

  setText(id, text) {
    const el = document.querySelector("#" + id);
    el.innerHTML = text;
  }
}
