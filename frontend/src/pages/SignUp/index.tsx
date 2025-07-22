import { Box, Typography, TextField, Button } from "@mui/material"
import { useForm } from "react-hook-form"
import { trpc } from '../../libs/trpc'
import { TRPCClientError } from '@trpc/client'
import { useNavigate } from "react-router-dom"

const CustomSxTextField = {
  width: '80%',
  marginBottom: 4,
  fontSize: '1.2rem',
  '& .MuiOutlinedInput-root': {
    fontSize: '1.2rem',
    '& fieldset': {
      borderColor: 'primary.main',
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'primary.main',
    opacity: 0.8,
    fontSize: '1.2rem',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'primary.main',
    opacity: 1,
    fontSize: '1.2rem',
  },
  '& .MuiOutlinedInput-input': {
    color: 'primary.main',
    opacity: 0.9,
    fontSize: '1.2rem',
  }
}

const ContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  background: 'linear-gradient(135deg, #12568e 0%, #67c2ff 100%)'
}

const FormStyle = {
  width: '30%',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  border: 3,
  borderColor: 'primary.main',
  borderRadius: 2,
  boxShadow: 3,
  background: 'rgba(255, 255, 255, 0.85)',
}

const ButtonStyle = {
  width: '80%',
  height: '60px',
  backgroundColor: 'primary.main',
  color: 'white',
  fontSize: '1.2rem',
  marginBottom: 6,
  '&:hover': {
    backgroundColor: 'primary.dark',
  },
}

export const SignUpPage = () => {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      navigate("/login")
    },
    onError: (error) => {
      const err = error as TRPCClientError<any>;
      const zodErrors = err.shape?.data?.zodError?.fieldErrors;

      if (zodErrors?.username?.[0]) setError("username", { message: zodErrors.username[0] });
      if (zodErrors?.email?.[0]) setError("email", { message: zodErrors.email[0] });
      if (zodErrors?.phone?.[0]) setError("phone", { message: zodErrors.phone[0] });
      if (zodErrors?.password?.[0]) setError("password", { message: zodErrors.password[0] });

      const field = (err.cause as any)?.field;
      if (typeof field === "string") {
        setError(field as any, { message: err.message });
      } else {
        setError("root", { message: err.message });
      }
    },
  })

  const onSubmit = (data: any) => {
    registerMutation.mutate(data);
  }

  return (
    <div style={ContainerStyle}>
      <Box sx={FormStyle} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h4" sx={{ padding: 4, textAlign: "center", color: "primary.main" }}>
          Sign Up
        </Typography>

        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          sx={CustomSxTextField}
          {...register("username", { required: "Username is required" })}
          error={Boolean(errors.username)}
          helperText={errors.username?.message?.toString()}
        />

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          sx={CustomSxTextField}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          })}
          error={Boolean(errors.email)}
          helperText={errors.email?.message?.toString()}
        />

        <TextField
          label="Phone number"
          variant="outlined"
          fullWidth
          sx={CustomSxTextField}
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^[0-9]{8,15}$/,
              message: "Invalid phone format",
            },
          })}
          error={Boolean(errors.phone)}
          helperText={errors.phone?.message?.toString()}
        />

        <TextField
          type="password"
          label="Password"
          variant="outlined"
          fullWidth
          sx={CustomSxTextField}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={Boolean(errors.password)}
          helperText={errors.password?.message?.toString()}
        />

        <Button sx={ButtonStyle} type="submit">
          Sign Up
        </Button>

        {errors.root && (
          <Typography variant="caption" color="error" sx={{ width: "80%", textAlign: "center", mb: 2 }}>
            {errors.root.message?.toString()}
          </Typography>
        )}
      </Box>
    </div>
  )
}