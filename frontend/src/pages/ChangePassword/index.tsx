import { Box, Typography, TextField, Button, Snackbar, Alert } from "@mui/material"
import { useForm } from "react-hook-form"
import { trpc } from "../../libs/trpc"
import { TRPCClientError } from "@trpc/client"
import { useUser } from "../../context"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

const CustomSxTextField = {
  width: "80%",
  marginBottom: 4,
  fontSize: "1.2rem",
  "& .MuiOutlinedInput-root": {
    fontSize: "1.2rem",
    "& fieldset": {
      borderColor: "primary.main",
      borderWidth: 2,
    },
    "&:hover fieldset": {
      borderColor: "primary.main",
    },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main",
    },
  },
  "& .MuiInputLabel-root": {
    color: "primary.main",
    opacity: 0.8,
    fontSize: "1.2rem",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "primary.main",
    opacity: 1,
    fontSize: "1.2rem",
  },
  "& .MuiOutlinedInput-input": {
    color: "primary.main",
    opacity: 0.9,
    fontSize: "1.2rem",
  },
}

const ContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "linear-gradient(135deg, #12568e 0%, #67c2ff 100%)",
}

const FormStyle = {
  width: "30%",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  border: 3,
  borderColor: "primary.main",
  borderRadius: 2,
  boxShadow: 3,
  background: "rgba(255, 255, 255, 0.85)",
}

const ButtonStyle = {
  width: "80%",
  height: "60px",
  backgroundColor: "primary.main",
  color: "white",
  fontSize: "1.2rem",
  marginBottom: 6,
  "&:hover": {
    backgroundColor: "primary.dark",
  },
}

export const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const user = useUser()
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm()

  const newPassword = watch("newPassword")

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      setOpenSnackbar(true)
      setTimeout(() => { navigate("/login") }, 1500)
    },
    onError: (error) => {
      const err = error as TRPCClientError<any>
      const zodErrors = err.shape?.data?.zodError?.fieldErrors

      if (zodErrors?.identifier?.[0])
        setError("identifier", { message: zodErrors.identifier[0] })
      if (zodErrors?.oldPassword?.[0])
        setError("oldPassword", { message: zodErrors.oldPassword[0] })
      if (zodErrors?.newPassword?.[0])
        setError("newPassword", { message: zodErrors.newPassword[0] })
      if (zodErrors?.confirmNewPassword?.[0])
        setError("confirmNewPassword", { message: zodErrors.confirmNewPassword[0] })

      if (!zodErrors && err.message) {
        setError("root", { message: err.message })
      }
    },
  })

  const onSubmit = (data: any) => {
    changePasswordMutation.mutate(data)
  }

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return
    setOpenSnackbar(false)
  }


  return (
    <div style={ContainerStyle}>
      <Box sx={FormStyle} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography
          variant="h4"
          sx={{ padding: 4, textAlign: "center", color: "primary.main" }}
        >
          Reset Password
        </Typography>

        <TextField
          label="Username / Email / Phone"
          variant="outlined"
          fullWidth
          sx={CustomSxTextField}
          {...register("identifier", { required: "Identifier is required" })}
          error={Boolean(errors.identifier)}
          helperText={errors.identifier?.message?.toString()}
        />

        <TextField
          type="password"
          label="Old Password"
          variant="outlined"
          fullWidth
          sx={CustomSxTextField}
          {...register("oldPassword", { required: "Old password is required" })}
          error={Boolean(errors.oldPassword)}
          helperText={errors.oldPassword?.message?.toString()}
        />

        <TextField
          type="password"
          label="New Password"
          variant="outlined"
          fullWidth
          sx={CustomSxTextField}
          {...register("newPassword", {
            required: "New password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
          })}
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword?.message?.toString()}
        />

        <TextField
          type="password"
          label="Confirm New Password"
          variant="outlined"
          fullWidth
          sx={CustomSxTextField}
          {...register("confirmNewPassword", {
            required: "Please confirm your new password",
            validate: (value) => value === newPassword || "Passwords do not match",
          })}
          error={Boolean(errors.confirmNewPassword)}
          helperText={errors.confirmNewPassword?.message?.toString()}
        />

        <Button
          sx={ButtonStyle}
          type="submit"
        >
          Change Password
        </Button>

        {errors.root && (
          <Typography variant="caption" color="error" sx={{ width: "80%", textAlign: "center", mb: 2, fontSize: '1rem' }}>
            {errors.root.message?.toString()}
          </Typography>
        
        )}
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          Password changed successfully!
        </Alert>
      </Snackbar>
    </div>
  )
}
