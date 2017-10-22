/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

var Alexa = require('alexa-sdk');

var states = {
    STARTMODE: '_STARTMODE',
    ASKMODE: '_ASKMODE',
    DESCRIPTIONMODE: '_DESCRIPTIONMODE'
};

var nodes = [{ "node": 1, "message": "Would you like some veges?", "yes": 5, "no": 2 },
             { "node": 2, "message": "Would you like some meat?", "yes": 3, "no": 4 },
             { "node": 3, "message": "Do you like spicy food?", "yes": 6, "no": 7 },
             { "node": 4, "message": "Do you like spicy food?", "yes": 8, "no": 9 },
// Answers & descriptions
             { "node": 5, "message": "I've made the decision for you, do you want to hear the decision?", "yes": 0, "no": 0, "description": [
                 'Eggplant in Garlic Sauce',
                 'Stir-Fried Broccoli',
                 'Orange Tofu'
             ] },
             { "node": 6, "message": "I've made the decision for you, do you want to hear the decision?", "yes": 0, "no": 0, "description": [
                 'Spicy Salt Chicken',
                 'Kung Bao Chicken',
                 'Hunan Beef',
                 'Twice Cooked Pork'
             ] },
             { "node": 7, "message": "I've made the decision for you, do you want to hear the decision?", "yes": 0, "no": 0, "description": [
                 'Mongolian Beef',
                 'Orange Chicken',
                 'Sweet & Sour Shrimp'
             ] },
             { "node": 8, "message": "I've made the decision for you, do you want to hear the decision?", "yes": 0, "no": 0, "description": [
                 'Szechwan Wonton',
                 'Chengdu Dumplings',
                 'Tofu Grandma Fried Rice'
             ] },
             { "node": 9, "message": "I've made the decision for you, do you want to hear the decision?", "yes": 0, "no": 0, "description": [
                 'Crab Rangoon',
                 'Egg rolls',
                 'Pork Cantonese Pan Fried Noodle'
             ] },
];


// this is used for keep track of visted nodes when we test for loops in the tree
var visited = [nodes.length];

// These are messages that Alexa says to the user during conversation

var welcomeMessage = "Welcome to Chinese cuisine decision maker application, say yes to enter decision tree.";

var repeatWelcomeMessage = "If you are a big fan of chinese food, say yes to make a decision for your meal";

var promptToStartMessage = "Now, I will ask you several question to help you make the decision.";

var promptToSayYesNo = "You should say yes or no to answer the question.";

var helpMessage = "You can say chinese food to ask for a recommandation.";

var goodbyeMessage = "Bye, see you next time.";

var speechNotFoundMessage = "Could not find speech for node";

var nodeNotFoundMessage = "In nodes array could not find node";

var descriptionNotFoundMessage = "Could not find description for node";

var loopsDetectedMessage = "A potential loop was detected on the node tree, please fix before continuing";

// the first node that we will use
var START_NODE = 1;

// --------------- Handlers -----------------------

// Called when the session starts.
exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandler, startGameHandlers, askQuestionHandlers, descriptionHandlers);
    alexa.execute();
};

// set state to start up and  welcome the user
var newSessionHandler = {
  'LaunchRequest': function () {
    this.handler.state = states.STARTMODE;
    this.response.speak(welcomeMessage).listen(repeatWelcomeMessage);
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function () {
    this.handler.state = states.STARTMODE;
    this.response.speak(helpMessage).listen(helpMessage);
    this.emit(':responseReady');
  },
  'Unhandled': function () {
    this.handler.state = states.STARTMODE;
    this.response.speak(promptToStartMessage).listen(promptToStartMessage);
    this.emit(':responseReady');
  }
};

// --------------- Functions that control the skill's behavior -----------------------

// Called at the start of the game, picks and asks first question for the user
var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'AMAZON.YesIntent': function () {
        // set state to asking questions
        this.handler.state = states.ASKMODE;
        // ask first question, the response will be handled in the askQuestionHandler
        var message = helper.getSpeechForNode(START_NODE);

        // record the node we are on
        this.attributes.currentNode = START_NODE;

        // ask the first question
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function () {
        // Handle No intent.
        this.response.speak(goodbyeMessage);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(goodbyeMessage);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(goodbyeMessage);
        this.emit(':responseReady');
    },
    'AMAZON.StartOverIntent': function () {
         this.response.speak(promptToStartMessage).listen(promptToStartMessage);
         this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak(helpMessage).listen(helpMessage);
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        this.response.speak(promptToStartMessage).listen(promptToStartMessage);
        this.emit(':responseReady');
    }
});


// user will have been asked a question when this intent is called. We want to look at their yes/no
// response and then ask another question. If we have asked more than the requested number of questions Alexa will
// make a choice, inform the user and then ask if they want to play again
var askQuestionHandlers = Alexa.CreateStateHandler(states.ASKMODE, {

    'AMAZON.YesIntent': function () {
        // Handle Yes intent.
        helper.yesOrNo(this,'yes');
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function () {
        // Handle No intent.
         helper.yesOrNo(this, 'no');
         this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak(promptToSayYesNo).listen(promptToSayYesNo);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(goodbyeMessage);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(goodbyeMessage);
        this.emit(':responseReady');
    },
    'AMAZON.StartOverIntent': function () {
        // reset the game state to start mode
        this.handler.state = states.STARTMODE;
        this.response.speak(welcomeMessage).listen(repeatWelcomeMessage);
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        this.response.speak(promptToSayYesNo).listen(promptToSayYesNo);
        this.emit(':responseReady');
    }
});

// user has heard the final choice and has been asked if they want to hear the description or to play again
var descriptionHandlers = Alexa.CreateStateHandler(states.DESCRIPTIONMODE, {

    'AMAZON.YesIntent': function () {
        helper.giveDescription(this);
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function () {
        // Handle No intent.
        this.response.speak(goodbyeMessage);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak(promptToSayYesNo).listen(promptToSayYesNo);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(goodbyeMessage);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(goodbyeMessage);
        this.emit(':responseReady');
    },
    'AMAZON.StartOverIntent': function () {
        // reset the game state to start mode
        this.handler.state = states.STARTMODE;
        this.response.speak(welcomeMessage).listen(repeatWelcomeMessage);
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        this.response.speak(promptToSayYesNo).listen(promptToSayYesNo);
        this.emit(':responseReady');
    }
});

// --------------- Helper Functions  -----------------------

var helper = {

    // gives the user more information on their final choice
    giveDescription: function (context) {

        // get the speech for the child node
        var description = helper.getDescriptionForNode(context.attributes.currentNode);
        var message = 'Try ' + description + ' today!';
        context.response.speak(message);
    },

    // logic to provide the responses to the yes or no responses to the main questions
    yesOrNo: function (context, reply) {

        // this is a question node so we need to see if the user picked yes or no
        var nextNodeId = helper.getNextNode(context.attributes.currentNode, reply);

        // error in node data
        if (nextNodeId == -1)
        {
            context.handler.state = states.STARTMODE;

            // the current node was not found in the nodes array
            // this is due to the current node in the nodes array having a yes / no node id for a node that does not exist
            context.response.speak(nodeNotFoundMessage);
        }

        // get the speech for the child node
        var message = helper.getSpeechForNode(nextNodeId);

        // have we made a decision
        if (helper.isAnswerNode(nextNodeId) === true) {
            context.handler.state = states.DESCRIPTIONMODE;
        }

        // set the current node to next node we want to go to
        context.attributes.currentNode = nextNodeId;

        context.response.speak(message).listen(message);
    },

    // gets the description for the given node id
    getDescriptionForNode: function (nodeId) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                var descriptions = nodes[i].description;
                return descriptions[Math.floor(Math.random() * descriptions.length)];
            }
        }
        return descriptionNotFoundMessage + nodeId;
    },

    // returns the speech for the provided node id
    getSpeechForNode: function (nodeId) {

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                return nodes[i].message;
            }
        }
        return speechNotFoundMessage + nodeId;
    },

    // checks to see if this node is an choice node or a decision node
    isAnswerNode: function (nodeId) {

        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                if (nodes[i].yes === 0 && nodes[i].no === 0) {
                    return true;
                }
            }
        }
        return false;
    },

    // gets the next node to traverse to based on the yes no response
    getNextNode: function (nodeId, yesNo) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].node == nodeId) {
                if (yesNo == "yes") {
                    return nodes[i].yes;
                }
                return nodes[i].no;
            }
        }
        // error condition, didnt find a matching node id. Cause will be a yes / no entry in the array but with no corrosponding array entry
        return -1;
    },

    // Recursively walks the node tree looking for nodes already visited
    // This method could be changed if you want to implement another type of checking mechanism
    // This should be run on debug builds only not production
    // returns false if node tree path does not contain any previously visited nodes, true if it finds one
    debugFunction_walkNode: function (nodeId) {

        // console.log("Walking node: " + nodeId);

        if( helper.isAnswerNode(nodeId) === true) {
            // found an answer node - this path to this node does not contain a previously visted node
            // so we will return without recursing further

            // console.log("Answer node found");
             return false;
        }

        // mark this question node as visited
        if( helper.debugFunction_AddToVisited(nodeId) === false)
        {
            // node was not added to the visited list as it already exists, this indicates a duplicate path in the tree
            return true;
        }

        // console.log("Recursing yes path");
        var yesNode = helper.getNextNode(nodeId, "yes");
        var duplicatePathHit = helper.debugFunction_walkNode(yesNode);

        if( duplicatePathHit === true){
            return true;
        }

        // console.log("Recursing no");
        var noNode = helper.getNextNode(nodeId, "no");
        duplicatePathHit = helper.debugFunction_walkNode(noNode);

        if( duplicatePathHit === true){
            return true;
        }

        // the paths below this node returned no duplicates
        return false;
    },

    // checks to see if this node has previously been visited
    // if it has it will be set to 1 in the array and we return false (exists)
    // if it hasnt we set it to 1 and return true (added)
    debugFunction_AddToVisited: function (nodeId) {

        if (visited[nodeId] === 1) {
            // node previously added - duplicate exists
            // console.log("Node was previously visited - duplicate detected");
            return false;
        }

        // was not found so add it as a visited node
        visited[nodeId] = 1;
        return true;
    }
};
