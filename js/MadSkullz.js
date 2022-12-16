// NFT Viewer for MadSkullz
// Author: @entropy_8_

const base_url = "https://cdn.madskullz.io/madskullz/metadata/";
const NFT_count = 6666;

window.addEventListener("load", function () {
  document.getElementById("token-id").addEventListener("keydown", function (evt) {
    if (evt.key == "Enter") {
      get_nft_attr();
    }
  });
});

function get_nft_attr() {
  let token_elem = document.getElementById("token-id");
  const token_id = pad_zeros(token_elem.value);
  document.getElementById("skullz-id").innerText = token_id;
  document.getElementById("skullz-list").innerHTML = "";
  fetch_nft_attr(token_id);
}

function fetch_nft_attr(token_id) {
  const url = base_url + token_id + ".json";
  let http_request = new XMLHttpRequest();
  http_request.open("GET", url, true);
  http_request.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let nft_obj = JSON.parse(this.responseText);
      let ratity_elem = document.getElementById("rarity");
      ratity_elem.classList.remove("rarity-great", "rarity-rare", "rarity-epic", "rarity-legendary", "rarity-forgottenz", "rarity-creatorz");
      ratity_elem.classList.add("rarity-" + nft_obj["rarity"].toLowerCase());
      ratity_elem.innerText = nft_obj["rarity"];

      document.getElementById("rank").innerText = nft_obj["rank"];
      document.getElementById("img").setAttribute("src", nft_obj["image"]);

      let traits_table = document.getElementById("skullz-traits");
      traits_table.innerHTML = "";

      let attr = "";
      nft_obj["attributes"].forEach(function (item, index, array) {
        if (item["trait_type"] === "Rarity") {
          return;
        }

        const trait_type = item["trait_type"];
        const trait_value = item["value"];
        const trait_rarity = item["rarity"];
        let search_trait = {};
        search_trait[trait_type] = trait_value;

        let tr = traits_table.insertRow();
        tr.classList.add("traits-row");

        let td = tr.insertCell();
        td.classList.add("traits-cell");
        td.appendChild(document.createTextNode(trait_type));

        td = tr.insertCell();
        td.classList.add("traits-cell", "right", "trait-value");
        let trait_value_obj = document.createElement("div");
        trait_value_obj.classList.add("center", "underline");
        trait_value_obj.innerText = trait_value;
        td.appendChild(trait_value_obj);
        trait_value_obj.addEventListener("click", function() {
          set_selected(this.closest(".traits-row"));
          const skullz_list = search_traits(search_trait);
          show_traits_list(trait_value, trait_rarity, skullz_list);
        });

        if (item["rarity"] != undefined) {
          const trait_count = SKULLZ_TRAITS[trait_type][trait_value]["count"];
          const percentage = (100.0 *  trait_count/ NFT_count).toFixed(2);
          const percentage2 = (100.0 / trait_count).toFixed(1);

          td = tr.insertCell();
          td.classList.add("traits-cell", "rarity-" + trait_rarity.toLowerCase());
          td.appendChild(document.createTextNode(trait_rarity));

          td = tr.insertCell();
          td.classList.add("traits-cell", "right");
          td.appendChild(document.createTextNode(`${percentage2}%`));

          td = tr.insertCell();
          td.classList.add("traits-cell", "right");
          td.appendChild(document.createTextNode(`${percentage}%`));
        }
      });
    }
  };
  http_request.send();
}

function search_traits(trait) {
  let skullz_list = [];
  const trait_type = Object.keys(trait);
  const trait_value = trait[trait_type];

  for (const sid in SKULLZ_DATA) {
    SKULLZ_DATA[sid]["attributes"].forEach(function (item, index, array) {
      if ((item["trait_type"] == trait_type) && (item["value"] == trait_value)) {
        skullz_list.push(sid);
      }
    });
  }

  return skullz_list;
}

function show_traits_list(trait_value, trait_rarity, skullz_list) {
  let skullz_list_elem = document.getElementById("skullz-list");
  skullz_list_elem.innerHTML = "";
  const trait_class = "rarity-" + trait_rarity.toLowerCase();
  let skullz_count_elem = document.createElement("div");
  skullz_count_elem.classList.add("flex", "skullz-count-header");
  skullz_count_elem.innerHTML = `Total Skullz with <span class="${trait_class} rarity">${trait_value}</span>: ${skullz_list.length}`;
  skullz_list_elem.appendChild(skullz_count_elem);

  skullz_list.forEach(function(skullz_id, index, array) {
    const skullz_obj = SKULLZ_DATA[skullz_id];
    let skullz_elem = document.createElement("div");
    skullz_elem.classList.add("skullz-list-item", "center");
    const rarity_class = "rarity-" + skullz_obj["rarity"].toLowerCase();
    skullz_elem.innerHTML = `<div class="${rarity_class} rank">${skullz_obj["rank"]}</div> <span class="underline">Skullz #${skullz_id}</span>`;
    skullz_list_elem.appendChild(skullz_elem);

    skullz_elem.addEventListener("click", function() {
      set_selected(this);
      const token_id = pad_zeros(skullz_id);
      document.getElementById("token-id").value = token_id;
      document.getElementById("skullz-id").innerText = token_id;
      fetch_nft_attr(token_id);
      document.getElementById("skullz-id").scrollIntoView();
    });
  });
}

function set_selected(item) {
  const selected_items = document.getElementsByClassName("selected");
  for (let idx = 0; idx < selected_items.length; idx++) {
    selected_items[idx].classList.remove("selected");
  }
  item.classList.add("selected");
}

function pad_zeros(token_id) {
  return ('0000' + token_id).slice(-4);
}
