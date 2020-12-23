App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
      window.ethereum.enable().catch(error => {
        // User denied account access
        console.log(error)
      })
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
      window.ethereum.enable().catch(error => {
        // User denied account access
        console.log(error)
      })
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("../build/contracts/Wiki.json", function(wiki) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Wiki = TruffleContract(wiki);
      // Connect provider to interact with contract
      App.contracts.Wiki.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Wiki.deployed().then(function(instance) {
      instance.pageEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var wikiInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Wiki.deployed().then(function(instance) {
      wikiInstance = instance;
      return wikiInstance.pagesCount();
    }).then(function(pagesCount) {
      var pagesResults = $("#pagesResults");
      pagesResults.empty();

      var pagesSelect = $('#pageName');
      pagesSelect.empty();

      var pagesSelect = $('#pageHash');
      pagesSelect.empty();

      for (let i = 0; i < pagesCount; i++) {
        wikiInstance.pages(i).then(function(page) {
          var name = page[1];
          var ipfshash = page[2];

          $('<p/>',{
              class: 'block'
          }).appendTo('#content');

          $('<a/>', {
              text: name,
              href: 'view.html?' + ipfshash
          }).appendTo('.block:last');

          $('<a/>', {
            text: ' edit',
            href: 'edit?' + ipfshash
          }).appendTo('.block:last');
        });
      }
    });
    
    loader.hide();
    content.show();
  },

  addPage: function() {
    var pageName = $('#pageName').val();
    var duplicate = false;

    App.contracts.Wiki.deployed().then(function(instance) {
      wikiInstance = instance;
      return wikiInstance.pagesCount();
    }).then(function(pagesCount) {
      for (let i = 0; i <= pagesCount; i++) {
        wikiInstance.pages(i).then(function(page) {
          if (pageName == page[1]) {
            duplicate = true;
            console.log("Duplicate Name Found!");
          } else if (i == pagesCount && duplicate == false) {
            // Wait for pages to update
            $("#content").hide();
            $("#loader").show();
            createFile("# test").then(hash => {
              return wikiInstance.addPage(pageName, hash, { from: App.account });
            });
          }
        });
      }
    }).catch(function(err) {
      console.error(err);
    });
  }
};

async function createFile (text) {
  const node = await Ipfs.create();
  const { path } = await node.add(text);

  await node.stop();

  return path;
}

async function getFile (cid) {
  const node = await window.Ipfs.create();

  const stream = node.cat(cid);
  let data = '';

  for await (const chunk of stream) {
      // chunks of data are returned as a Buffer, convert it back to a string
      data += chunk.toString();
  }

  await node.stop();

  return data;
}