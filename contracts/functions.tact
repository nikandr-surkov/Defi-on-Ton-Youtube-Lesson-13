import "@stdlib/deploy";

struct TokenInfo {
    ticker: String;
    decimals: Int as uint8;
}

// Global function to calculate the average of two integers
fun average(a: Int, b: Int): Int {
    return (a + b) / 2;
}

contract Functions with Deployable {

    deployer: Address;

    // Initialize deployer's address
    init() {
        self.deployer = sender();
    }

    // Internal function, only the deployer can call this method
    fun onlyDeployer() {
        require(sender() == self.deployer, "Only the deployer is permitted here");
    }

    // Handle "privileged" messages
    receive("privileged") {
        self.onlyDeployer();
    }

    // Internal function, return TokenInfo based on index
    fun getInfo(index: Int): TokenInfo {
        if(index == 1) {
            return TokenInfo{ticker: "TON", decimals: 9};
        }
        if(index == 2) {
            return TokenInfo{ticker: "ETH", decimals: 18};
        }
        return TokenInfo{ticker: "unknown", decimals: 0};
    }

    // Handle "message-based L1" messages
    receive("message-based L1") {
        let blockchain: TokenInfo = self.getInfo(1);
        self.reply(blockchain.ticker.asComment());
    }

    // Get the average of two integers
    get fun result(): Int {
        return average(1, 10);
    }

}
