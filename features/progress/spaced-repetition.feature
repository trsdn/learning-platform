@progress @spaced-repetition
Feature: Spaced Repetition
  As a learner
  I want the system to use spaced repetition
  So that I can efficiently retain what I learn

  Background:
    Given I am logged in as a learner

  @SR-001 @smoke
  Scenario: New items start with short intervals
    Given I have never practiced a learning path
    When I complete a task correctly
    Then the next review should be scheduled soon
    And the initial interval should be appropriate for new learning

  @SR-002
  Scenario: Correct answers increase intervals
    Given I have practiced an item multiple times correctly
    When I answer correctly again
    Then the review interval should increase
    And the new interval should be longer than the previous one

  @SR-003
  Scenario: Incorrect answers reset intervals
    Given I have a long review interval for an item
    When I answer incorrectly
    Then the review interval should be shortened
    And the item should appear more frequently

  @SR-004
  Scenario: Easy items have longer intervals
    Given I am reviewing an item
    When I mark it as "Easy"
    Then the interval should increase more than normal
    And the item should appear less frequently

  @SR-005
  Scenario: Hard items have shorter intervals
    Given I am reviewing an item
    When I mark it as "Hard"
    Then the interval should increase less than normal
    And the item should appear more frequently than easy items

  @SR-006
  Scenario: Due items are prioritized
    Given I have items due for review
    And I have items not yet due
    When I start a practice session
    Then due items should appear before non-due items

  @SR-007
  Scenario: Mastery level reflects retention
    Given I have been practicing regularly
    When I view my progress
    Then I should see mastery levels for each item
    And mastery should reflect my retention rate
