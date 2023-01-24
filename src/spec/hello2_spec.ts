function hello_spec() {
    return "hello"
}

describe("Hello", function() {
    it("trouloulou", function() {
        var text = hello_spec();
        expect(text).toBe("hello");
    }); 
    it("tralala", function() {
        var text = "tra";
        expect(text.length).toBe(5);
    }); 
});