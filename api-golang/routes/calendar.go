package routes

import (
	"net/http"

	"api-golang/database"
	"github.com/gin-gonic/gin"
)

type CalendarItem struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	UserID      int    `json:"user_id"`
}

// GET /calendar
func GetCalendar(c *gin.Context) {
	rows, err := database.DB().Query(`
		SELECT id, title, description, start_date, end_date, user_id
		FROM calendar
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var items []CalendarItem

	for rows.Next() {
		var it CalendarItem
		_ = rows.Scan(&it.ID, &it.Title, &it.Description, &it.StartDate, &it.EndDate, &it.UserID)
		items = append(items, it)
	}

	c.JSON(http.StatusOK, items)
}

// POST /calendar
func CreateCalendar(c *gin.Context) {
	var body CalendarItem

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}

	res, err := database.DB().Exec(
		"INSERT INTO calendar (title, description, start_date, end_date, user_id) VALUES (?, ?, ?, ?, ?)",
		body.Title, body.Description, body.StartDate, body.EndDate, body.UserID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := res.LastInsertId()
	body.ID = int(id)

	c.JSON(http.StatusCreated, body)
}
// GET /calendar/:id
func GetCalendarByID(c *gin.Context) {
    id := c.Param("id")

    var item CalendarItem

    err := database.DB().QueryRow(
        "SELECT id, title, description, start_date, end_date FROM calendar WHERE id = ?",
        id,
    ).Scan(&item.ID, &item.Title, &item.Description, &item.StartDate, &item.EndDate, &item.UserID)


    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
        return
    }

    c.JSON(http.StatusOK, item)
}

// PUT /calendar/:id
func UpdateCalendar(c *gin.Context) {
    id := c.Param("id")

    var body CalendarItem
    if err := c.BindJSON(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
        return
    }

    _, err := database.DB().Exec(
        "UPDATE calendar SET title=?, description=?, start_date=?, end_date=?, user_id=? WHERE id=?",
        body.Title, body.Description, body.StartDate, body.EndDate, id,
    )

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "updated"})
}
// DELETE /calendar/:id
func DeleteCalendar(c *gin.Context) {
    id := c.Param("id")

    _, err := database.DB().Exec("DELETE FROM calendar WHERE id = ?", id)

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}
