@progress @tracking
Feature: User Progress Tracking
  As a learner
  I want to track my learning progress
  So that I can see my improvement over time

  Background:
    Given I am logged in as a learner

  @UP-001 @smoke
  Scenario: View overall progress on dashboard
    Given I have completed some practice sessions
    When I view the dashboard
    Then I should see my overall progress
    And I should see progress for each topic

  @UP-002
  Scenario: View learning path progress
    Given I have started a learning path
    When I view the learning path details
    Then I should see my completion percentage
    And I should see how many tasks I've mastered

  @UP-003
  Scenario: View streak information
    Given I have practiced multiple days in a row
    When I view the dashboard
    Then I should see my current streak
    And I should see my longest streak

  @UP-004
  Scenario: Streak resets after missing a day
    Given I have a streak of 5 days
    When I miss practicing for a day
    Then my current streak should reset to 0
    And my longest streak should remain unchanged

  @UP-005
  Scenario: View session history
    Given I have completed multiple practice sessions
    When I view my history
    Then I should see past session dates
    And I should see accuracy for each session
    And I should see duration for each session

  @UP-006
  Scenario: View performance by task type
    Given I have completed various task types
    When I view my statistics
    Then I should see accuracy per task type
    And I should identify my strengths and weaknesses

  @UP-007
  Scenario: Progress syncs across devices
    Given I complete a practice session on one device
    When I log in on another device
    Then my progress should be synchronized
    And I should continue from where I left off

  @UP-008
  Scenario: View today's practice summary
    Given I have practiced today
    When I view the dashboard
    Then I should see today's practice summary
    And I should see items reviewed today
    And I should see accuracy for today
