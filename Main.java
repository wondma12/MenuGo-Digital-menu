package main;

import java.util.Scanner;
import person.Person;

public class Main {

    public static void main(String[] args) {

        Scanner input = new Scanner(System.in);

        System.out.print("Enter Country: ");
        String country = input.nextLine();

        System.out.print("Enter number of persons: ");
        int n = input.nextInt();
        input.nextLine();

        Person[] persons = new Person[n];

        // Input
        for (int i = 0; i < n; i++) {

            System.out.println("\nPerson " + (i + 1));

            System.out.print("Name: ");
            String name = input.nextLine();

            System.out.print("Age: ");
            int age = input.nextInt();

            System.out.print("ID: ");
            int id = input.nextInt();
            input.nextLine();

            persons[i] = new Person(name, age, id);
        }

        // Display all
        System.out.println("\n===== All Persons =====");

        for (Person p : persons) {
            p.display();
        }

        // Update age
        System.out.print("\nEnter index to update age: ");
        int index = input.nextInt();

        if (index >= 0 && index < n) {

            System.out.print("Enter new age: ");
            int newAge = input.nextInt();

            persons[index].updateAge(newAge);

        } else {

            System.out.println("Invalid Index!");
        }

        // Display again
        System.out.println("\n===== After Age Update =====");

        for (Person p : persons) {
            p.display();
        }

        // Create modified person
        System.out.print("\nEnter index to replace: ");
        int replaceIndex = input.nextInt();
        input.nextLine();

        Person modifiedPerson = null;

        if (replaceIndex >= 0 && replaceIndex < n) {

            System.out.print("Enter new name: ");
            String newName = input.nextLine();

            System.out.print("Enter new age: ");
            int newAge = input.nextInt();

            modifiedPerson = persons[replaceIndex].getModifiedPerson(newName, newAge);

            persons[replaceIndex] = modifiedPerson;

        } else {

            System.out.println("Invalid Index!");
        }

        // Display modified person
        if (modifiedPerson != null) {

            System.out.println("\n===== Modified Person =====");
            modifiedPerson.display();
        }

        // Total persons
        Person.showTotalPersons();

        input.close();
    }
}