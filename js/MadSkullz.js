// NFT Viewer for @MadSkullz_NFT
// Author: @entropy_8_

const base_url = "https://cdn.madskullz.io/madskullz/metadata/";
const NFT_count = 6666;

window.addEventListener("load", function () {
  process_params(get_query_params());

  const search_input_elem = document.getElementById("token-id");
  search_input_elem.focus();
  search_input_elem.addEventListener("keydown", function (evt) {
    if (evt.key == "Enter") {
      get_nft_attr(true);
    }
  });

  const theme_btn = document.getElementById("theme-btn");
  theme_btn.addEventListener("click", function() {
    if (document.body.classList.contains("dark")) {
      theme_btn.src = "./images/dark.svg";
      document.body.classList.remove("dark");
    }
    else {
      theme_btn.src = "./images/light.svg";
      document.body.classList.add("dark");
    }
  })

});

function get_query_params() {
  const url_parser = new URL(this.document.URL);
  const params_str = url_parser.search.split("?")[1];

  if (params_str) {
    params = new URLSearchParams(params_str);
    for (let pair of params.entries()) {
      let first_param = {
        "key": pair[0].toLowerCase(),
        "value": pair[1].toLowerCase(),
      }
      return first_param;
    }
  }

  return undefined;
}

function process_params(param) {
  if (param == undefined) {
    return;
  }

  let token_elem = document.getElementById("token-id");

  // Search by SKullz ID
  if (param["key"] === "skullz") {
    token_elem.value = param["value"];
  }
  // Search by Token ID
  else if (param["key"] === "token") {
    token_elem.value = param["value"] + "t";
  }
  // Search by Token ID
  else if (param["key"] === "rank") {
    token_elem.value = param["value"] + "r";
  }

  get_nft_attr(true);

}

function get_nft_attr(reset_list=false) {

  let skullz_id = undefined;
  let token_index = undefined;

  let token_elem = document.getElementById("token-id");
  let token_info = token_elem.value;

  let tsearch1 = token_info.match(/^t\d{1,4}/i);
  let tsearch2 = token_info.match(/^\d{1,4}t/i);
  let is_token_index = tsearch1 || tsearch2;
  if (tsearch1) {
    token_info = tsearch1[0].replace(/\D/g, "");
  }
  else if (tsearch2) {
    token_info = tsearch2[0].replace(/\D/g, "");
  }

  let rsearch = token_info.match(/^r\d{1,4}/i) || token_info.match(/^\d{1,4}r/i);
  document.getElementById("token-unrevealed").classList.add("hidden");
  document.getElementById("token-not-found").classList.add("hidden");

  if (is_token_index) {
    token_index = trim_zeros(token_info);
    if (SKULLZ_IDS[token_index] != undefined) {
      skullz_id = pad_zeros(SKULLZ_IDS[token_index]);
    }
    else {
      document.getElementById("missing-onez").innerText = `${token_index}`;
      document.getElementById("token-unrevealed").classList.remove("hidden");
      document.getElementById("token-not-found").classList.add("hidden");
    }
  }
  else if (rsearch) {
    const rank = token_info.replace(/\D/g, "");
    skullz_id = search_rank(rank);

    if (skullz_id == undefined) {
      document.getElementById("token-not-found").classList.remove("hidden");
      document.getElementById("token-unrevealed").classList.add("hidden");
      document.getElementById("skullz-info").classList.add("hidden");
      document.getElementById("skullz-list-box").classList.add("hidden");
      return;
    }
    skullz_id = pad_zeros(skullz_id);
    token_index = search_token_index(skullz_id);
  }
  else {
    token_info = token_info.replace(/\D/g, "");
    skullz_id = pad_zeros(token_info);
    token_index = search_token_index(skullz_id);
  }

  const token_index_elem = document.getElementById("token-index");
  if (skullz_id != undefined) {
    document.getElementById("skullz-id").innerText = skullz_id;
    if (reset_list) {
      document.getElementById("skullz-count-header").innerHTML = "";
      document.getElementById("skullz-list").innerHTML = "";
    }
    fetch_nft_attr(skullz_id);
    document.getElementById("skullz-info").classList.remove("hidden");
    document.getElementById("skullz-list-box").classList.remove("hidden");

    if (token_index != -1 ) {
      token_index_elem.innerText = `#${token_index}`;
      document.getElementById("snowtrace-url").href= `https://snowtrace.io/token/0x3025c5c2aa6eb7364555aac0074292195701bbd6?a=${token_index}`;
      document.getElementById("kalao-url").href= `https://marketplace.kalao.io/nft/0x3025c5c2aa6eb7364555aac0074292195701bbd6_${token_index}`;
      document.getElementById("joepegs-url").href= `https://joepegs.com/item/0x3025c5c2aa6eb7364555aac0074292195701bbd6/${token_index}`;
      document.getElementById("opensea-url").href= `https://opensea.io/assets/avalanche/0x3025c5c2aa6eb7364555aac0074292195701bbd6/${token_index}`;
      document.getElementById("campfire-url").href= `https://campfire.exchange/collections/0x3025c5c2aa6eb7364555aac0074292195701bbd6/${token_index}`;
      document.getElementById("nftrade-url").href= `https://nftrade.com/assets/avalanche/0x3025c5c2aa6eb7364555aac0074292195701bbd6/${token_index}`;
      document.getElementById("snowtrace-url").hidden = false;
      document.getElementById("kalao-url").hidden = false;
      document.getElementById("joepegs-url").hidden = false;
      document.getElementById("opensea-url").hidden = false;
      document.getElementById("nftrade-url").hidden = false;
    }
    else {
      console.log(`Token of Skullz #${skullz_id} is still hidden in The Missing Onez.`)
      token_index_elem.innerText = "Unrevealed (Missing Onez)";
      document.getElementById("snowtrace-url").hidden = true;
      document.getElementById("kalao-url").hidden = true;
      document.getElementById("joepegs-url").hidden = true;
      document.getElementById("opensea-url").hidden = true;
      document.getElementById("nftrade-url").hidden = true;
    }
  }
  else {
    console.log(`Token #${token_index} is still hidden in The Missing Onez.`);
    document.getElementById("skullz-info").classList.add("hidden");
    document.getElementById("skullz-list-box").classList.add("hidden");
  }

}

function fetch_nft_attr(skullz_id) {
  const url = base_url + skullz_id + ".json";
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
        td.classList.add("traits-cell", "trait-value", "right", "padding-right-075");
        let trait_value_obj = document.createElement("div");

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

function search_token_index(skullz_id) {
  for (const token_index in SKULLZ_IDS) {
    if (SKULLZ_IDS[token_index] == skullz_id) {
      return token_index;
    }
  }
  return -1;
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

function search_rank(rank) {
  let skullz_id = undefined;

  for (const sid in SKULLZ_DATA) {
    if (SKULLZ_DATA[sid]["rank"] == rank) {
      skullz_id = sid
    }
  }

  return skullz_id;
}

function show_traits_list(trait_value, trait_rarity, skullz_list) {
  let skullz_list_elem = document.getElementById("skullz-list");
  skullz_list_elem.innerHTML = "";
  const trait_class = "rarity-" + trait_rarity.toLowerCase();
  let skullz_count_elem = document.getElementById("skullz-count-header");
  skullz_count_elem.innerHTML = `Total Skullz with <span class="${trait_class} rarity">${trait_value}</span>: <span class="counter">${skullz_list.length}</span>`;

  skullz_list.forEach(function(skullz_id, index, array) {
    const skullz_obj = SKULLZ_DATA[skullz_id];
    let skullz_elem = document.createElement("div");
    skullz_elem.classList.add("skullz-list-item", "center");
    const rarity_class = "rarity-" + skullz_obj["rarity"].toLowerCase();
    skullz_elem.innerHTML = `<div class="${rarity_class} rank">${skullz_obj["rank"]}</div> <span class="underline">Skullz #${pad_zeros(skullz_id)}</span>`;
    skullz_list_elem.appendChild(skullz_elem);

    skullz_elem.addEventListener("click", function() {
      set_selected(this);
      document.getElementById("token-id").value = skullz_id;
      document.getElementById("skullz-id").innerText = skullz_id;
      get_nft_attr();
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

function trim_zeros(token_id) {
  return token_id.replace(/^0+/, "");
}
