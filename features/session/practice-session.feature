@session @practice
Feature: Practice Session
  As a learner
  I want to complete practice sessions
  So that I can learn and retain knowledge through spaced repetition

  Background:
    Given I am logged in as a learner
    And I have selected a learning path

  @PS-001 @smoke
  Scenario: Start a practice session
    Given I am on the learning path page
    When I click the "Start" button
    Then a practice session should begin
    And I should see the first task
    And I should see my progress indicator showing "1/N"

  @PS-002
  Scenario: Answer a multiple choice task correctly
    Given I am in an active practice session
    And the current task is a multiple choice task
    When I select the correct answer
    And I submit my answer
    Then I should see positive feedback
    And I should be able to continue to the next task

  @PS-003
  Scenario: Answer a multiple choice task incorrectly
    Given I am in an active practice session
    And the current task is a multiple choice task
    When I select an incorrect answer
    And I submit my answer
    Then I should see the correct answer highlighted
    And I should see corrective feedback
    And I should be able to continue to the next task

  @PS-004
  Scenario: Complete a cloze deletion task
    Given I am in an active practice session
    And the current task is a cloze deletion task
    When I fill in the blank with the correct text
    And I submit my answer
    Then I should see positive feedback

  @PS-005 @wip
  Scenario: Complete a matching task
    Given I am in an active practice session
    And the current task is a matching task
    When I correctly match all pairs
    And I submit my answer
    Then I should see positive feedback
    And all matches should be highlighted as correct

  @PS-006 @wip
  Scenario: Complete an ordering task
    Given I am in an active practice session
    And the current task is an ordering task
    When I arrange all items in the correct order
    And I submit my answer
    Then I should see positive feedback

  @PS-007 @wip
  Scenario: Complete a word scramble task
    Given I am in an active practice session
    And the current task is a word scramble task
    When I arrange the letters to form the correct word
    And I submit my answer
    Then I should see positive feedback

  @PS-008
  Scenario: Complete a true/false task
    Given I am in an active practice session
    And the current task is a true/false task
    When I select the correct answer
    And I submit my answer
    Then I should see positive feedback

  @PS-009 @wip
  Scenario: Complete an error detection task
    Given I am in an active practice session
    And the current task is an error detection task
    When I identify all errors in the text
    And I submit my answer
    Then I should see which errors I found
    And I should see any errors I missed

  @PS-010 @smoke @wip
  Scenario: Complete a full practice session
    Given I am in an active practice session
    When I complete all tasks in the session
    Then I should see the session results page
    And I should see my accuracy percentage
    And I should see a breakdown of my performance

  @PS-011
  Scenario: Navigate back during a session
    Given I am in an active practice session
    And I have completed at least one task
    When I click the back button
    Then I should see a confirmation dialog
    And I should be able to cancel and continue
    And I should be able to exit and lose progress

  @PS-012 @wip
  Scenario: Session progress is saved
    Given I am in an active practice session
    And I have completed some tasks
    When I accidentally close the browser
    And I return to the learning path
    Then I should be able to resume my session
    And my previous answers should be preserved
