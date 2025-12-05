@session @tasks
Feature: Task Types
  As a learner
  I want to interact with different task types
  So that I can learn through varied exercises

  Background:
    Given I am logged in as a learner
    And I am in an active practice session

  # Multiple Choice Tasks
  @TT-MC-001
  Scenario: Multiple choice displays all options
    Given the current task is a multiple choice task
    Then I should see the question text
    And I should see all answer options
    And only one option should be selectable at a time

  @TT-MC-002
  Scenario: Multiple choice selection is clear
    Given the current task is a multiple choice task
    When I select an option
    Then that option should be visually highlighted
    And other options should appear deselected

  # Multiple Select Tasks
  @TT-MS-001
  Scenario: Multiple select allows multiple selections
    Given the current task is a multiple select task
    Then I should see all answer options
    And I should be able to select multiple options
    And I should see how many selections are expected

  @TT-MS-002
  Scenario: Multiple select partial credit
    Given the current task is a multiple select task
    When I select some correct answers but not all
    And I submit my answer
    Then I should see partial feedback
    And I should see which ones I missed

  # Cloze Deletion Tasks
  @TT-CD-001
  Scenario: Cloze deletion displays context
    Given the current task is a cloze deletion task
    Then I should see the sentence with a blank
    And I should see an input field for the blank
    And I should understand what to fill in

  @TT-CD-002
  Scenario: Cloze deletion provides hints
    Given the current task is a cloze deletion task
    When I request a hint
    Then I should see a hint for the answer
    And my score should be adjusted accordingly

  # Matching Tasks
  @TT-MA-001
  Scenario: Matching displays pairs
    Given the current task is a matching task
    Then I should see left column items
    And I should see right column items
    And I should be able to connect matching pairs

  @TT-MA-002
  Scenario: Matching by drag and drop
    Given the current task is a matching task
    When I drag an item from the left column
    And I drop it on the corresponding item on the right
    Then the match should be created
    And I should see the connection visualized

  # Ordering Tasks
  @TT-OR-001
  Scenario: Ordering displays items to arrange
    Given the current task is an ordering task
    Then I should see all items to be ordered
    And items should be draggable
    And the target order should be clear

  @TT-OR-002
  Scenario: Ordering via drag and drop
    Given the current task is an ordering task
    When I drag an item to a new position
    Then the item should move to that position
    And other items should adjust accordingly

  # Word Scramble Tasks
  @TT-WS-001
  Scenario: Word scramble displays scrambled letters
    Given the current task is a word scramble task
    Then I should see scrambled letters
    And I should see slots for the answer
    And I should be able to arrange letters

  # True/False Tasks
  @TT-TF-001
  Scenario: True/False displays statement
    Given the current task is a true/false task
    Then I should see a statement to evaluate
    And I should see True and False buttons
    And only one option should be selectable

  # Error Detection Tasks
  @TT-ED-001
  Scenario: Error detection displays text with errors
    Given the current task is an error detection task
    Then I should see a text passage
    And I should be able to click on words to mark errors
    And marked words should be visually distinct

  @TT-ED-002
  Scenario: Error detection allows unmarking
    Given the current task is an error detection task
    And I have marked a word as an error
    When I click on that word again
    Then the word should be unmarked
    And it should return to normal appearance

  # Flashcard Tasks
  @TT-FC-001
  Scenario: Flashcard displays front
    Given the current task is a flashcard task
    Then I should see the front of the card
    And I should see a button to reveal the answer

  @TT-FC-002
  Scenario: Flashcard flip reveals answer
    Given the current task is a flashcard task
    When I click to reveal the answer
    Then I should see the back of the card
    And I should be able to rate my recall
