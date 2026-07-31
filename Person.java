package person;

public class Person {

    // Instance variable
    private String name;
    private int age;

    // Static variable
    private static int totalPersons;

    // Instance constant (final)
    private final int id;

    // Static constant (static final)
    public static final String COUNTRY = "Ethiopia";

    // Static block
    static {
        totalPersons = 0;
        System.out.println("Welcome! Person class has been loaded.");
    }

    // Instance block
    {
        totalPersons++;
    }

    // First constructor
    public Person(String name) {
        this.name = name;
        this.age = 0;
        this.id = totalPersons;
    }

    // Second constructor
    public Person(String name, int age) {
        this(name);
        this.age = age;
    }

    // Third constructor
    public Person(String name, int age, int tempId) {
        this(name, age);
        // tempId is ignored because id is final
        // id is initialized automatically using totalPersons
    }

    // Update age
    public void updateAge(int newAge) {
        age = newAge;
    }

    // Return modified object
    public Person getModifiedPerson(String newName, int newAge) {
        return new Person(newName, newAge);
    }

    // Display information
    public void display() {
        System.out.println("----------------------");
        System.out.println("Name    : " + name);
        System.out.println("Age     : " + age);
        System.out.println("ID      : " + id);
        System.out.println("Country : " + COUNTRY);
    }

    // Static method
    public static void showTotalPersons() {
        System.out.println("\nTotal Persons Created: " + totalPersons);
    }
}